const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const puppeteer = require('puppeteer');

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: "client-1"
  }),
  puppeteer: {
    headless: true,   
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('WhatsApp client is ready!');

  scrapeIndeedJobs().then(jobs => {
    const chatId = '120363314056681154@g.us'; 
    if (jobs.length === 0) {
      console.log('No jobs found.');
      return;
    }

    const message = jobs.map(job => `Job Title: ${job.title}\nLink: ${job.link}`).join('\n\n');
    client.sendMessage(chatId, message)
      .then(() => console.log('Message sent'))
      .catch(err => console.error('Error sending message:', err));
  }).catch(err => {
    console.error('Error scraping jobs:', err);
  });
});

client.initialize();

async function scrapeIndeedJobs() {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    console.log('Accessing Indeed page...');
    await page.goto('https://br.indeed.com/');

    await new Promise(resolve => setTimeout(resolve, 15000));
    await page.type('input[name="q"]', 'Desenvolvedor Júnior', { delay: 50 });
    await page.type('input[name="l"]', 'São Paulo', { delay: 50 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.keyboard.press('Enter');
    await page.waitForNavigation();

    await page.waitForSelector('.mosaic-zone', { timeout: 10000 });
    console.log('Searching for jobs...');

    const jobs = await page.evaluate(() => {
      const jobElements = document.querySelectorAll('.mosaic-zone a');
      const jobData = [];

      jobElements.forEach(job => {
        const title = job.innerText;
        const link = job.href;
        jobData.push({ title, link });
      });
      return jobData;
    });

    console.log(jobs);

    await browser.close();
    return jobs;
  } catch (error) {
    console.error('Error in scrapeIndeedJobs:', error);
    return [];
  }
}
