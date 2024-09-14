const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteerExtra.use(StealthPlugin());

async function scrapeIndeedJobsAndSendMessage() {
  const browser = await puppeteerExtra.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });  
  const page = await browser.newPage();

  console.log('Acessando a página Indeed');
  await page.goto('https://br.indeed.com/');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
    
  await page.type('input[name="q"]', 'Desenvolvedor Júnior', {delay: 50});
  await page.type('input[name="l"]', 'São Paulo', {delay: 50});

  await new Promise(resolve => setTimeout(resolve, 500));

  await page.keyboard.press('Enter');

  await page.waitForNavigation();

  await page.waitForSelector('.mosaic-zone', {timeout: 10000});
  console.log('Pesquisando vagas...');
  
  const jobs = await page.evaluate(() => {

    const jobElements = document.querySelectorAll('.mosaic-zone a');
    const jobData = [];

    jobElements.forEach(job => {
      const title = job.innerText; 
      const link = job.href;
      jobData.push({title, link});
    });
    return jobData;
  });

  console.log(jobs);

  // Format message
  const message = jobs.map(job => `${job.title}\n${job.link}`).join('\n\n');

  // Send message via WhatsApp Web
  const whatsappPage = await browser.newPage();
  await whatsappPage.goto('https://web.whatsapp.com/');
  
  await new Promise(resolve => setTimeout(resolve, 15000)); // Wait for user to scan QR code if not logged in

  // Find the chat (group or contact) by its name
  await whatsappPage.waitForSelector('div[title=""]'); // Replace "Group Name" with the actual group name or contact
  await whatsappPage.click('div[title="Group Name"]');

  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for chat to load

  // Send the message
  await whatsappPage.waitForSelector('div[data-tab="6"]'); // Chat input box
  await whatsappPage.type('div[data-tab="6"]', message, {delay: 100});

  await whatsappPage.keyboard.press('Enter');

  console.log('Message sent');
  
  await browser.close();
};

scrapeIndeedJobsAndSendMessage();
