using System.Security.Cryptography;
using System.Text;
using JobMailApi.Settings;
using Microsoft.Extensions.Options;

namespace JobMailApi.Services;

public class EncryptionService
{
    private readonly byte[] _key;

    public EncryptionService(IOptions<EncryptionOptions> options)
    {
        var keyValue = options.Value.Key;
        if (string.IsNullOrWhiteSpace(keyValue))
        {
            throw new InvalidOperationException("Encryption:Key is not configured.");
        }

        var keyBytes = Encoding.UTF8.GetBytes(keyValue);
        if (keyBytes.Length != 32)
        {
            throw new InvalidOperationException("Encryption key must be 32 bytes for AES-256.");
        }

        _key = keyBytes;
    }

    public string Encrypt(string plaintext)
    {
        using var aes = Aes.Create();
        aes.Key = _key;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        var plaintextBytes = Encoding.UTF8.GetBytes(plaintext);
        var cipherBytes = encryptor.TransformFinalBlock(plaintextBytes, 0, plaintextBytes.Length);

        var payload = new byte[aes.IV.Length + cipherBytes.Length];
        Buffer.BlockCopy(aes.IV, 0, payload, 0, aes.IV.Length);
        Buffer.BlockCopy(cipherBytes, 0, payload, aes.IV.Length, cipherBytes.Length);

        return Convert.ToBase64String(payload);
    }

    public string Decrypt(string payload)
    {
        var allBytes = Convert.FromBase64String(payload);
        if (allBytes.Length < 17)
        {
            throw new InvalidOperationException("Encrypted payload is invalid.");
        }

        using var aes = Aes.Create();
        aes.Key = _key;
        aes.Mode = CipherMode.CBC;
        aes.Padding = PaddingMode.PKCS7;

        var iv = new byte[aes.BlockSize / 8];
        var cipherBytes = new byte[allBytes.Length - iv.Length];
        Buffer.BlockCopy(allBytes, 0, iv, 0, iv.Length);
        Buffer.BlockCopy(allBytes, iv.Length, cipherBytes, 0, cipherBytes.Length);

        aes.IV = iv;
        using var decryptor = aes.CreateDecryptor();
        var plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);

        return Encoding.UTF8.GetString(plainBytes);
    }
}
