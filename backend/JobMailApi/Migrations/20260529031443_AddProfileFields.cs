using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JobMailApi.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CurrentCompany",
                table: "CandidateProfiles",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CvFileName",
                table: "CandidateProfiles",
                type: "character varying(260)",
                maxLength: 260,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CvFilePath",
                table: "CandidateProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CvLink",
                table: "CandidateProfiles",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "GitHubUrl",
                table: "CandidateProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LinkedInUrl",
                table: "CandidateProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NoticePeriod",
                table: "CandidateProfiles",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "CandidateProfiles",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PortfolioUrl",
                table: "CandidateProfiles",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreferredLocations",
                table: "CandidateProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreferredRoles",
                table: "CandidateProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WorkAuthorization",
                table: "CandidateProfiles",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrentCompany",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "CvFileName",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "CvFilePath",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "CvLink",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "GitHubUrl",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "LinkedInUrl",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "NoticePeriod",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "PortfolioUrl",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "PreferredLocations",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "PreferredRoles",
                table: "CandidateProfiles");

            migrationBuilder.DropColumn(
                name: "WorkAuthorization",
                table: "CandidateProfiles");
        }
    }
}
