using JobMailApi.Models;
using Microsoft.EntityFrameworkCore;

namespace JobMailApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<CandidateProfile> CandidateProfiles => Set<CandidateProfile>();
    public DbSet<EmailHistory> EmailHistories => Set<EmailHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
            entity.Property(u => u.FullName).IsRequired().HasMaxLength(200);
            entity.Property(u => u.PasswordHash).IsRequired();
            entity.Property(u => u.GmailAddress).IsRequired().HasMaxLength(256);
            entity.Property(u => u.GmailAppPasswordEncrypted).IsRequired();
        });

        modelBuilder.Entity<CandidateProfile>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.UserId).IsUnique();
            entity.Property(p => p.FullName).HasMaxLength(200);
            entity.Property(p => p.CurrentRole).HasMaxLength(200);
            entity.Property(p => p.Location).HasMaxLength(200);
            entity.Property(p => p.Objective).HasColumnType("text");
            entity.Property(p => p.Skills).HasColumnType("text");
            entity.Property(p => p.PhoneNumber).HasMaxLength(50);
            entity.Property(p => p.LinkedInUrl).HasMaxLength(500);
            entity.Property(p => p.GitHubUrl).HasMaxLength(500);
            entity.Property(p => p.PortfolioUrl).HasMaxLength(500);
            entity.Property(p => p.CvLink).HasMaxLength(1000);
            entity.Property(p => p.CvFileName).HasMaxLength(260);
            entity.Property(p => p.CvFilePath).HasColumnType("text");
            entity.Property(p => p.CurrentCompany).HasMaxLength(200);
            entity.Property(p => p.NoticePeriod).HasMaxLength(100);
            entity.Property(p => p.PreferredRoles).HasColumnType("text");
            entity.Property(p => p.PreferredLocations).HasColumnType("text");
            entity.Property(p => p.WorkAuthorization).HasColumnType("text");
            entity.Property(p => p.ExperienceJson).HasColumnType("text");
            entity.Property(p => p.ProjectsJson).HasColumnType("text");
            entity.Property(p => p.EducationJson).HasColumnType("text");
            entity.Property(p => p.Achievements).HasColumnType("text");
            entity.Property(p => p.OpenSourceContributions).HasColumnType("text");
            entity.Property(p => p.CvRawText).HasColumnType("text");

            entity.HasOne(p => p.User)
                .WithOne(u => u.CandidateProfile)
                .HasForeignKey<CandidateProfile>(p => p.UserId);
        });

        modelBuilder.Entity<EmailHistory>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId);
            entity.Property(e => e.ToEmail).IsRequired().HasMaxLength(256);
            entity.Property(e => e.Subject).IsRequired().HasMaxLength(500);
            entity.Property(e => e.SentAt).IsRequired();

            entity.HasOne(e => e.User)
                .WithMany(u => u.EmailHistories)
                .HasForeignKey(e => e.UserId);
        });
    }
}
