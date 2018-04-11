const express = require('express');
const app     = express();
const cheerio = require('cheerio');
const fs      = require('fs');
const config  = require('./config');
const request = require('request-promise-native');
const ejs     = require('ejs');
const webshot = require('webshot');

let ogCount = 0;

// Load index.html
const indexFile = fs.readFileSync(`${__dirname}/../besedogled/dist/index.html`, 'utf8', ( err, file ) => err ? reject(err) : resolve(file));
const indexHtml = indexFile.toString();

app.get('/analiza/:analysisId', async ( req, res ) => {

  try {

    const analysisId    = req.params.analysisId;
    // const templatePath = `${__dirname}/og_templates/snippet.ejs`;
    // const ogImagePath  = `${__dirname}/og_renders/snippet-${snippetId}.png`;
    const $ = cheerio.load(indexHtml);

    // const ogExists = await new Promise(( resolve ) => {
    //   fs.exists(`${__dirname}/og_renders/snippet-${snippetId}.png`, ( exists ) => resolve(exists));
    // });

    // get analysis data from API
    const analysisData = JSON.parse(await request(`http://admin.besedogled.si/getAnalysisMeta/?id=${analysisId}`));

    // if ( !ogExists ) {
    //   console.log(`Og count: ${ogCount}`);
    //   ogCount++;
    //   renderOg(templatePath, snippetData, ogImagePath);
    // }

    $('title').text(`${analysisData.title || 'Brez naslova'} - Besedogled`);
    $('.removeme').remove();
    // <meta property="og:image"          content="${config.URL}/images/snippet-${snippetId}.png" />
    // <meta name="twitter:image" content="${config.URL}/images/snippet-${snippetId}.png">
    $('head').append(`
      <meta property="og:url"                content="http://besedogled.si/analiza/${analysisId}" />
      <meta property="og:type"               content="article" />
      <meta property="og:title"              content="${analysisData.title || 'Analiza brez naslova'}" />
      
      <meta name="twitter:title" content="${analysisData.title || 'Analiza brez naslova'}">

      <meta property="og:image"          content="${analysisData.photo}" />
      <meta name="twitter:image" content="${analysisData.photo}">
    `);

    res.send($.html());

  } catch ( err ) {
    console.log(err);
    res.status(400).send('Something went wrong');
  }

});

app.use('/', express.static(`${__dirname}/../besedogled/dist`));
//app.use('/izseki', express.static(`${__dirname}/parlatube/dist`));
// app.use('/soocenje/:videoId', express.static(`${__dirname}/parlatube/dist`));

// app.get('/embed/:snippetId', async ( req, res ) => {
//   try {

//     const $         = cheerio.load(indexHtml);

//     $('head').append(`<script src="https://cdn.parlameter.si/v1/parlassets/js/iframeResizer.contentWindow.min.js"></script>`);

//     res.send($.html());
//   } catch ( err ) {
//     res.status(400).send('Something went wrong');
//   }
// });

// // app.use('/embed/:snippetId', express.static(`${__dirname}/parlatube/dist`));


// app.use('/images', express.static(`${__dirname}/og_renders`));

app.listen(7061, () => {
  console.log('Server listening on port 7061');
});

async function renderOg( templatePath, data, imagePath ) {

  const template = await new Promise(( resolve, reject ) => {
    fs.readFile(templatePath, 'utf8', ( err, file ) => err ? reject(err) : resolve(file));
  });

  const templateHtml = template.toString();

  const rendered = ejs.render(templateHtml, data);

  await new Promise(( resolve, reject ) => {
    webshot(rendered, imagePath, {
      screenSize : {
        width  : 1200,
        height : 630
      },
      shotSize   : {
        width  : 1200,
        height : 630
      },
      siteType   : 'html'
    }, ( err ) => err ? reject(err) : resolve(imagePath));
  });

}
