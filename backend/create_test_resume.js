const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ margin: 50 });
const stream = fs.createWriteStream('sample_resume.pdf');

doc.pipe(stream);

// Header
doc.fontSize(24).font('Helvetica-Bold').text('Alex Dev', { align: 'center' });
doc.fontSize(12).font('Helvetica').text('alex.dev@example.com | (555) 123-4567 | San Francisco, CA', { align: 'center' });
doc.moveDown(2);

// Professional Summary
doc.fontSize(14).font('Helvetica-Bold').fillColor('#2563eb').text('PROFESSIONAL SUMMARY');
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#2563eb');
doc.moveDown(0.5);
doc.fontSize(11).font('Helvetica').fillColor('black')
    .text('Highly motivated Full Stack Developer with over 5 years of experience in building scalable web applications. Proficient in JavaScript, React, Node.js, and Python. Passionate about clean code, performance optimization, and AI integration.');
doc.moveDown(1.5);

// Skills
doc.fontSize(14).font('Helvetica-Bold').fillColor('#2563eb').text('SKILLS');
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#2563eb');
doc.moveDown(0.5);
doc.fontSize(11).font('Helvetica').fillColor('black');
doc.text('Languages: JavaScript (ES6+), Python, HTML5, CSS3, SQL');
doc.text('Frontend: React.js, Redux, Tailwind CSS, Next.js');
doc.text('Backend: Node.js, Express, MongoDB, PostgreSQL');
doc.text('Tools: Git, Docker, AWS, Jenkins, Jest');
doc.moveDown(1.5);

// Experience
doc.fontSize(14).font('Helvetica-Bold').fillColor('#2563eb').text('WORK EXPERIENCE');
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#2563eb');
doc.moveDown(0.5);

doc.fontSize(12).font('Helvetica-Bold').fillColor('black').text('Senior Full Stack Developer');
doc.fontSize(11).font('Helvetica-Oblique').text('Tech Innovations Inc. | January 2022 - Present');
doc.fontSize(11).font('Helvetica');
doc.text('- Led a team of 5 developers to rebuild the legacy e-commerce platform using React and Node.js');
doc.text('- Improved site performance by 40% through code splitting and image optimization');
doc.text('- Integrated AI-powered recommendation engine using Python and TensorFlow');
doc.moveDown(1);

doc.fontSize(12).font('Helvetica-Bold').text('Web Developer');
doc.fontSize(11).font('Helvetica-Oblique').text('StartUp Solutions | June 2019 - December 2021');
doc.fontSize(11).font('Helvetica');
doc.text('- Developed and maintained multiple client websites using MERN stack');
doc.text('- Collaborated with designers to implement responsive UI/UX designs');
doc.text('- Implemented RESTful APIs and managed MongoDB databases');
doc.moveDown(1.5);

// Education
doc.fontSize(14).font('Helvetica-Bold').fillColor('#2563eb').text('EDUCATION');
doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke('#2563eb');
doc.moveDown(0.5);
doc.fontSize(12).font('Helvetica-Bold').fillColor('black').text('Bachelor of Science in Computer Science');
doc.fontSize(11).font('Helvetica-Oblique').text('University of Technology | 2015 - 2019');

doc.end();

stream.on('finish', () => {
    console.log('Resume generated successfully: sample_resume.pdf');
});
