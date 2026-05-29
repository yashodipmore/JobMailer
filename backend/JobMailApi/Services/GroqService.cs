using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using JobMailApi.Contracts;
using JobMailApi.Settings;
using Microsoft.Extensions.Options;

namespace JobMailApi.Services;

public class GroqService
{
    private const string ApiUrl = "https://api.groq.com/openai/v1/chat/completions";
    private readonly HttpClient _httpClient;
    private readonly GroqOptions _options;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true
    };

    public GroqService(HttpClient httpClient, IOptions<GroqOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;
    }

    public async Task<GroqAiResponse> GenerateAsync(string systemPrompt, string userMessage, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            throw new InvalidOperationException("Groq:ApiKey is not configured.");
        }

        var requestPayload = new
        {
            model = _options.Model,
            max_tokens = 800,
            temperature = 0.2,
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = userMessage }
            }
        };

        var requestJson = JsonSerializer.Serialize(requestPayload, JsonOptions);
        using var request = new HttpRequestMessage(HttpMethod.Post, ApiUrl);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);
        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        request.Content = new StringContent(requestJson, Encoding.UTF8, "application/json");

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        var responseText = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Groq API error {(int)response.StatusCode}: {responseText}");
        }

        var contentText = ExtractContentText(responseText);
        return ParseResponse(contentText);
    }

    private static string ExtractContentText(string responseText)
    {
        try
        {
            using var document = JsonDocument.Parse(responseText);
            if (!document.RootElement.TryGetProperty("choices", out var choicesElement))
            {
                return responseText;
            }

            if (choicesElement.ValueKind != JsonValueKind.Array || choicesElement.GetArrayLength() == 0)
            {
                return responseText;
            }

            var message = choicesElement[0].GetProperty("message");
            if (!message.TryGetProperty("content", out var contentElement))
            {
                return responseText;
            }

            var text = contentElement.GetString();
            return string.IsNullOrWhiteSpace(text) ? responseText : text.Trim();
        }
        catch (JsonException)
        {
            return responseText;
        }
    }

    private static GroqAiResponse ParseResponse(string text)
    {
        if (TryParseJson(text, out var parsed))
        {
            return Normalize(parsed);
        }

        var cleaned = StripCodeFence(text);
        if (!string.Equals(cleaned, text, StringComparison.Ordinal) && TryParseJson(cleaned, out parsed))
        {
            return Normalize(parsed);
        }

        var candidate = ExtractJsonCandidate(cleaned);
        if (candidate != null && TryParseJson(candidate, out parsed))
        {
            return Normalize(parsed);
        }

        return new GroqAiResponse("question", text.Trim(), null);
    }

    private static bool TryParseJson(string json, out GroqAiResponse parsed)
    {
        try
        {
            var result = JsonSerializer.Deserialize<GroqAiResponse>(json, JsonOptions);
            if (result == null)
            {
                parsed = null!;
                return false;
            }

            parsed = result;
            return true;
        }
        catch (JsonException)
        {
            parsed = null!;
            return false;
        }
    }

    private static GroqAiResponse Normalize(GroqAiResponse response)
    {
        return response with { Reply = response.Reply ?? string.Empty };
    }

    private static string StripCodeFence(string text)
    {
        var trimmed = text.Trim();
        if (!trimmed.StartsWith("```", StringComparison.Ordinal))
        {
            return text;
        }

        var firstBreak = trimmed.IndexOf('\n');
        if (firstBreak < 0)
        {
            return text;
        }

        var lastFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
        if (lastFence <= firstBreak)
        {
            return text;
        }

        return trimmed.Substring(firstBreak + 1, lastFence - firstBreak - 1).Trim();
    }

    private static string? ExtractJsonCandidate(string text)
    {
        var start = text.IndexOf('{');
        var end = text.LastIndexOf('}');
        if (start < 0 || end <= start)
        {
            return null;
        }

        return text.Substring(start, end - start + 1);
    }

    public sealed record GroqAiResponse(string Type, string Reply, EmailDraft? Email);
}
