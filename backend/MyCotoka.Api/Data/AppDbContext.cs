using Microsoft.EntityFrameworkCore;
using MyCotoka.Api.Models;

namespace MyCotoka.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Device> Devices => Set<Device>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Device>().HasIndex(d => d.SerialNumber).IsUnique();
        modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Device)
            .WithMany(d => d.Subscriptions)
            .HasForeignKey(s => s.DeviceId);

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Client)
            .WithMany(c => c.Subscriptions)
            .HasForeignKey(s => s.ClientId);
    }
}