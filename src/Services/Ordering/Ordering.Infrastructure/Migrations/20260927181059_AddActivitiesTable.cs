using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ordering.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddActivitiesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Databases created before this migration existed may already contain an
            // identical Activities table, created by OrderContextSeed's former raw-SQL
            // fallback without a __EFMigrationsHistory row. Guard the DDL so the
            // migration is a no-op there and simply records itself as applied.
            // The DDL below is the output of `dotnet ef migrations script` for the
            // CreateTable/CreateIndex operations in the designer model.
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'[dbo].[Activities]', N'U') IS NULL
BEGIN
    CREATE TABLE [Activities] (
        [Id] int NOT NULL IDENTITY,
        [EventId] uniqueidentifier NOT NULL,
        [ActivityType] nvarchar(50) NOT NULL,
        [EntityType] nvarchar(50) NOT NULL,
        [EntityId] nvarchar(100) NOT NULL,
        [Title] nvarchar(200) NOT NULL,
        [Description] nvarchar(500) NULL,
        [Actor] nvarchar(100) NULL,
        [SourceService] nvarchar(50) NOT NULL,
        [Metadata] nvarchar(max) NULL,
        [OccurredAt] datetime2 NOT NULL,
        [CreatedBy] nvarchar(max) NULL,
        [CreatedDate] datetime2 NULL,
        [LastModifiedBy] nvarchar(max) NULL,
        [LastModifiedDate] datetime2 NULL,
        CONSTRAINT [PK_Activities] PRIMARY KEY ([Id]),
        CONSTRAINT [UX_Activities_EventId] UNIQUE ([EventId])
    );

    CREATE INDEX [IX_Activities_ActivityType] ON [Activities] ([ActivityType]);
    CREATE INDEX [IX_Activities_CreatedDate] ON [Activities] ([CreatedDate]);
    CREATE INDEX [IX_Activities_EntityType] ON [Activities] ([EntityType]);
    CREATE INDEX [IX_Activities_OccurredAt] ON [Activities] ([OccurredAt]);
END
");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Activities");
        }
    }
}
