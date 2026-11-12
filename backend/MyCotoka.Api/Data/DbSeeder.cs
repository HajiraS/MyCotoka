using MyCotoka.Api.Models;

namespace MyCotoka.Api.Data;

/// <summary>
/// Seeds the database with demo data on application startup.
/// Called from Program.cs after migrations run.
/// All operations are idempotent — they only insert data when the relevant tables are empty
/// (or when a specific user is missing).
/// </summary>
public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        // ------------------------------------------------------------------
        // 1. Users
        // ------------------------------------------------------------------
        if (!db.Users.Any(u => u.Username == "admin"))
        {
            db.Users.Add(new User
            {
                Username = "admin",
                Email = "admin@mycotoka.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin1234!"),
                Role = "Admin"
            });
        }

        // ------------------------------------------------------------------
        // 2. Clients
        // ------------------------------------------------------------------
        if (!db.Clients.Any())
        {
            db.Clients.AddRange(
                new Client { CompanyName = "Acme Corp", ContactEmail = "contact@acme.com" },
                new Client { CompanyName = "Globex Inc", ContactEmail = "info@globex.com" },
                new Client { CompanyName = "Initech", ContactEmail = "hello@initech.com" },
                new Client { CompanyName = "Umbrella Corp", ContactEmail = "contact@umbrella.com" },
                new Client { CompanyName = "Stark Industries", ContactEmail = "info@stark.com" },
                new Client { CompanyName = "Wayne Enterprises", ContactEmail = "contact@wayne.com" },
                new Client { CompanyName = "Hooli", ContactEmail = "hello@hooli.com" },
                new Client { CompanyName = "Wonka Industries", ContactEmail = "contact@wonka.com" },
                new Client { CompanyName = "Soylent Corp", ContactEmail = "info@soylent.com" },
                new Client { CompanyName = "Cyberdyne Systems", ContactEmail = "contact@cyberdyne.com" }
            );
        }

        // ------------------------------------------------------------------
        // 3. Devices  (more units so we can assign many subscriptions)
        // ------------------------------------------------------------------
        if (!db.Devices.Any())
        {
            db.Devices.AddRange(
                // X1 series
                new Device { SerialNumber = "SN-1001", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1002", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1003", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1004", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-1005", Model = "CotokaDevice-X1", Status = DeviceStatus.InStock },
                // X2 series
                new Device { SerialNumber = "SN-2001", Model = "CotokaDevice-X2", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-2002", Model = "CotokaDevice-X2", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-2003", Model = "CotokaDevice-X2", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-2004", Model = "CotokaDevice-X2", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-2005", Model = "CotokaDevice-X2", Status = DeviceStatus.InStock },
                // X3 series
                new Device { SerialNumber = "SN-3001", Model = "CotokaDevice-X3", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-3002", Model = "CotokaDevice-X3", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-3003", Model = "CotokaDevice-X3", Status = DeviceStatus.InStock },
                new Device { SerialNumber = "SN-3004", Model = "CotokaDevice-X3", Status = DeviceStatus.InStock },
                // Some already in other states
                new Device { SerialNumber = "SN-4001", Model = "CotokaDevice-X2", Status = DeviceStatus.Maintenance },
                new Device { SerialNumber = "SN-4002", Model = "CotokaDevice-X3", Status = DeviceStatus.Maintenance },
                new Device { SerialNumber = "SN-5001", Model = "CotokaDevice-X1", Status = DeviceStatus.Retired },
                new Device { SerialNumber = "SN-5002", Model = "CotokaDevice-X2", Status = DeviceStatus.Retired }
            );
        }

        // Persist so clients and devices get real IDs
        db.SaveChanges();

        // ------------------------------------------------------------------
        // 4. testuser (ClientAdmin) linked to first client
        // ------------------------------------------------------------------
        if (!db.Users.Any(u => u.Username == "testuser"))
        {
            var firstClient = db.Clients.OrderBy(c => c.Id).FirstOrDefault();

            db.Users.Add(new User
            {
                Username = "testuser",
                Email = "testuser@mycotoka.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test1234!"),
                Role = "ClientAdmin",
                ClientId = firstClient?.Id
            });
        }

        // ------------------------------------------------------------------
        // 5. Subscriptions — varied plans, prices, statuses, and dates
        //    so the dashboard graphs (trend, revenue-by-client, top plans)
        //    and the Churn Rate KPI have realistic data.
        // ------------------------------------------------------------------
        if (!db.Subscriptions.Any())
        {
            var clients = db.Clients.OrderBy(c => c.Id).ToList();
            var devices = db.Devices
                .Where(d => d.Status == DeviceStatus.InStock)
                .OrderBy(d => d.Id)
                .ToList();

            // Need enough clients + devices to seed a useful history
            if (clients.Count >= 6 && devices.Count >= 12)
            {
                // Helper to keep the list readable
                Subscription Sub(
                    int deviceIndex,
                    int clientIndex,
                    string plan,
                    decimal price,
                    SubscriptionStatus status,
                    int startMonthsAgo,
                    int? endMonthsAgo = null)
                {
                    var start = DateTime.UtcNow.AddMonths(-startMonthsAgo).Date;
                    DateTime? end = endMonthsAgo.HasValue
                        ? DateTime.UtcNow.AddMonths(-endMonthsAgo.Value).Date
                        : null;

                    return new Subscription
                    {
                        DeviceId = devices[deviceIndex].Id,
                        ClientId = clients[clientIndex].Id,
                        PlanName = plan,
                        MonthlyPrice = price,
                        Status = status,
                        StartDate = start,
                        EndDate = end
                    };
                }

                var subscriptions = new List<Subscription>
                {
                    // ---- Still Active (spread across months for the trend line) ----
                    Sub(0,  0, "Basic",      29.99m,  SubscriptionStatus.Active,  8),
                    Sub(1,  1, "Pro",        49.99m,  SubscriptionStatus.Active,  7),
                    Sub(2,  2, "Enterprise", 99.00m,  SubscriptionStatus.Active,  6),
                    Sub(3,  0, "Pro",        49.99m,  SubscriptionStatus.Active,  5),
                    Sub(4,  3, "Basic",      29.99m,  SubscriptionStatus.Active,  4),
                    Sub(5,  4, "Enterprise", 99.00m,  SubscriptionStatus.Active,  3),
                    Sub(6,  5, "Pro",        49.99m,  SubscriptionStatus.Active,  2),
                    Sub(7,  1, "Basic",      29.99m,  SubscriptionStatus.Active,  1),

                    // ---- Paused (counts toward total, not active MRR) ----
                    Sub(8,  2, "Pro",        49.99m,  SubscriptionStatus.Paused,  5),

                    // ---- Cancelled / Expired (drive the Churn Rate + red trend line) ----
                    // Started earlier, cancelled later → endDate populates the "cancelled" series
                    Sub(9,  3, "Basic",      29.99m,  SubscriptionStatus.Cancelled, 9, endMonthsAgo: 6),
                    Sub(10, 4, "Pro",        49.99m,  SubscriptionStatus.Cancelled, 8, endMonthsAgo: 4),
                    Sub(11, 5, "Enterprise", 99.00m,  SubscriptionStatus.Cancelled, 7, endMonthsAgo: 3),
                    Sub(0,  0, "Basic",      29.99m,  SubscriptionStatus.Expired,   10, endMonthsAgo: 7), // reuse device index only for seed variety; real FK is by Id
                };

                // Fix the last one to use a free device index if we accidentally reused
                // (we have 12+ InStock devices; indices 0-11 are safe above)
                // The Expired one above reuses device 0 only in the helper call —
                // change it to a distinct index to keep one-device-one-active-sub clean:
                subscriptions[12] = Sub(11, 0, "Basic", 29.99m, SubscriptionStatus.Expired, 10, endMonthsAgo: 7);

                // Actually keep a clean list without index collision on active devices:
                // Rebuild a final clean set with distinct device indices for active/paused.
                subscriptions = new List<Subscription>
                {
                    // Active — 8 subscriptions across different months & clients
                    Sub(0,  0, "Basic",      29.99m,  SubscriptionStatus.Active,  8),
                    Sub(1,  1, "Pro",        49.99m,  SubscriptionStatus.Active,  7),
                    Sub(2,  2, "Enterprise", 99.00m,  SubscriptionStatus.Active,  6),
                    Sub(3,  0, "Pro",        49.99m,  SubscriptionStatus.Active,  5),
                    Sub(4,  3, "Basic",      29.99m,  SubscriptionStatus.Active,  4),
                    Sub(5,  4, "Enterprise", 99.00m,  SubscriptionStatus.Active,  3),
                    Sub(6,  5, "Pro",        49.99m,  SubscriptionStatus.Active,  2),
                    Sub(7,  1, "Basic",      29.99m,  SubscriptionStatus.Active,  1),

                    // Paused
                    Sub(8,  2, "Pro",        49.99m,  SubscriptionStatus.Paused,  5),

                    // Cancelled (have EndDate → show on trend chart + increase churn %)
                    Sub(9,  3, "Basic",      29.99m,  SubscriptionStatus.Cancelled, 9, endMonthsAgo: 6),
                    Sub(10, 4, "Pro",        49.99m,  SubscriptionStatus.Cancelled, 8, endMonthsAgo: 4),
                    Sub(11, 5, "Enterprise", 99.00m,  SubscriptionStatus.Cancelled, 7, endMonthsAgo: 2),
                };

                // Optional extra cancelled for stronger churn signal (~25% churn)
                // (device indices stop at 11 for InStock list of 12; skip extra if not enough)

                db.Subscriptions.AddRange(subscriptions);

                // Mark devices that currently have an active or paused subscription as Assigned
                var assignedDeviceIds = subscriptions
                    .Where(s => s.Status == SubscriptionStatus.Active || s.Status == SubscriptionStatus.Paused)
                    .Select(s => s.DeviceId)
                    .Distinct()
                    .ToHashSet();

                foreach (var device in devices)
                {
                    if (assignedDeviceIds.Contains(device.Id))
                        device.Status = DeviceStatus.Assigned;
                }
            }
        }

        // Final save
        db.SaveChanges();
    }
}