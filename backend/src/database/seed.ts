import { createDatabase } from './connection';
import * as bcrypt from 'bcryptjs';

async function seedDatabase() {
  const db = createDatabase();
  
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await db.run('DELETE FROM ticket_signatures');
    await db.run('DELETE FROM ticket_media');
    await db.run('DELETE FROM ticket_work_logs');
    await db.run('DELETE FROM tickets');
    await db.run('DELETE FROM technicians');

    // Hash passwords
    const passwordHash = await bcrypt.hash('password123', 10);

    // Seed technicians
    const technician1 = await db.run(`
      INSERT INTO technicians (name, username, password_hash, email, phone, photo_url, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'John Mitchell',
      'john.tech',
      passwordHash,
      'john.mitchell@fieldtech.com',
      '(555) 123-4567',
      '/images/john-photo.jpg',
      'Senior Technician'
    ]);

    const technician2 = await db.run(`
      INSERT INTO technicians (name, username, password_hash, email, phone, photo_url, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      'Sarah Johnson',
      'sarah.field',
      passwordHash,
      'sarah.johnson@fieldtech.com',
      '(555) 987-6543',
      '/images/sarah-photo.jpg',
      'Field Specialist'
    ]);

    console.log('Technicians created:', technician1.lastID, technician2.lastID);

    // Seed tickets
    const tickets = [
      {
        ticket_number: 'FT-2024-001',
        technician_id: technician1.lastID,
        customer_name: 'Acme Corporation',
        customer_address: '123 Business Ave, Suite 100, San Francisco, CA 94105',
        customer_phone: '(415) 555-0123',
        job_location: '123 Business Ave, Suite 100, San Francisco, CA 94105',
        work_to_do: 'Install new fiber optic network infrastructure in main server room. Configure switches and test all connections.',
        scheduled_date: '2024-11-25',
        scheduled_time: '09:00',
        status: 'Assigned'
      },
      {
        ticket_number: 'FT-2024-002',
        technician_id: technician1.lastID,
        customer_name: 'Tech Startup Inc.',
        customer_address: '456 Innovation Blvd, Palo Alto, CA 94301',
        customer_phone: '(650) 555-0456',
        job_location: '456 Innovation Blvd, Palo Alto, CA 94301',
        work_to_do: 'Troubleshoot WiFi connectivity issues. Replace access points if necessary. Optimize network performance.',
        scheduled_date: '2024-11-25',
        scheduled_time: '14:30',
        status: 'Assigned'
      },
      {
        ticket_number: 'FT-2024-003',
        technician_id: technician2.lastID,
        customer_name: 'Downtown Retail Store',
        customer_address: '789 Market Street, San Francisco, CA 94103',
        customer_phone: '(415) 555-0789',
        job_location: '789 Market Street, San Francisco, CA 94103',
        work_to_do: 'Install point-of-sale system network connections. Configure POS terminals and test credit card processing.',
        scheduled_date: '2024-11-26',
        scheduled_time: '10:00',
        status: 'Assigned'
      },
      {
        ticket_number: 'FT-2024-004',
        technician_id: technician2.lastID,
        customer_name: 'Medical Office Building',
        customer_address: '321 Health Plaza, Oakland, CA 94612',
        customer_phone: '(510) 555-0321',
        job_location: '321 Health Plaza, Oakland, CA 94612',
        work_to_do: 'Upgrade security camera system. Install new DVR and configure remote access for building management.',
        scheduled_date: '2024-11-26',
        scheduled_time: '13:00',
        status: 'In Progress'
      }
    ];

    for (const ticket of tickets) {
      await db.run(`
        INSERT INTO tickets (
          ticket_number, technician_id, customer_name, customer_address, 
          customer_phone, job_location, work_to_do, scheduled_date, 
          scheduled_time, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        ticket.ticket_number,
        ticket.technician_id,
        ticket.customer_name,
        ticket.customer_address,
        ticket.customer_phone,
        ticket.job_location,
        ticket.work_to_do,
        ticket.scheduled_date,
        ticket.scheduled_time,
        ticket.status
      ]);
    }

    console.log('Sample tickets created successfully.');

    // Add sample work log for the "In Progress" ticket
    const inProgressTicket = await db.get(`
      SELECT id FROM tickets WHERE status = 'In Progress' LIMIT 1
    `);

    if (inProgressTicket) {
      await db.run(`
        INSERT INTO ticket_work_logs (ticket_id, work_description)
        VALUES (?, ?)
      `, [
        inProgressTicket.id,
        'Arrived on site at 1:00 PM. Conducted initial assessment of existing camera system. Identified 3 malfunctioning cameras that need replacement. Ordered new equipment for delivery tomorrow.'
      ]);
      console.log('Sample work log created.');
    }

    console.log('Database seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await db.close();
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedDatabase().catch(console.error);
}

export { seedDatabase };