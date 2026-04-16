const cron = require("node-cron");
const db = require("../database/db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "montayahia8@gmail.com",
    pass: "jwxu cdsg deuj nbms"
  }
});

cron.schedule("0 8 * * *", async () => {
  console.log("Checking overdue books...");
  
  const [overdue] = await db.query(`
    SELECT borrow.*, users.email, users.name, books.title 
    FROM borrow 
    JOIN users ON borrow.user_id = users.id 
    JOIN books ON borrow.book_id = books.id 
    WHERE borrow.return_date < CURDATE()
  `);
  
  for (const item of overdue) {
    await transporter.sendMail({
      to: item.email,
      subject: "⚠️ Book return overdue",
      html: `<p>Hello ${item.name},</p>
             <p>Your book "${item.title}" is overdue.</p>
             <p>Please return it as soon as possible.</p>`
    });
  }
});