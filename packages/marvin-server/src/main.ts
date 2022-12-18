/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import * as cors from 'cors';
import * as bodyParser from 'body-parser';

import * as puppeteer from 'puppeteer';

import { Flow, Discovery, Runner, State } from '@marvin/discovery';

const root = path.join(__dirname, '..', '..', '..', 'projects');
if (!fs.existsSync(root)) {
  fs.mkdirSync(root);
}

const app = express();
app.use(cors());
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);

app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to marvin-server!' });
});

/**
 * curl -X POST -d '{"name": "test", "url":"http://localhost:4200"}' http://localhost:3000/api/projects -H "Content-Type: application/json"
 */
app.post('/api/projects', (req, res) => {
  const { body } = req;

  if (body) {
    const { name, url } = body;
    if (!name || !url) {
      res.status(400).send({ message: 'Name and url are required!' });
    } else {
      
      if (fs.existsSync(path.join(root, name))) {
        res.status(400).send({ message: 'Project already exists!' });
      } else {
        fs.mkdirSync(path.join(root, name));
        fs.writeFileSync(
          path.join(root, name, 'config.json'),
          JSON.stringify(
            {
              path: name,
              defaultTimeout: 3000,
              rootUrl: url,
              urlReplacers: [],
              optimizer: {
                exclude: [],
              },
              aliases: {
                action: [],
                input: [],
                info: [],
                iterators: [],
              },
            },
            null,
            2
          )
        );

        res.status(200).send();
      }
    }
  } else {
    res.status(400).send({ message: 'Body is required!' });
  }
});


app.get('/api/projects/:projectName/:file', (req, res) => {
  const { params } = req;
  const { projectName, file } = params;


  if (fs.existsSync(path.join(root, projectName))) {
    try {
      const outputFile = fs.readFileSync(
        path.join(root, projectName, `${file}.json`),
        'utf8'
      );
      const output = JSON.parse(outputFile);
      res.json(output)
    } catch (e) {
      res.status(400).send({ message: 'Invalid config file!' });
    }
  } else {
    res.status(400).send({ message: 'Project does not exist!' });
  }
});


app.post('/api/projects/:projectName/:file', (req, res) => {
  const { params, body } = req;
  const { projectName, file } = params;
  const { data } = body;

  if (fs.existsSync(path.join(root, projectName))) {
    try {
      fs.writeFileSync(
        path.join(root, projectName, `${file}.json`),
        JSON.stringify(
          data,
          null,
          2
        )
      );
      res.json(data)
    } catch (e) {
      res.status(400).send({ message: 'Error writing file' });
    }
  } else {
    res.status(400).send({ message: 'Project does not exist!' });
  }
});

/**
 * curl -X POST  http://localhost:3000/api/projects/test/run -H "Content-Type: application/json"
 */
app.post('/api/run/:projectName',  async (req, res, next) => {
  console.log('here')
  const { params } = req;
  const { projectName } = params;
  const { body } = req;
  console.log('hhhhere ')
  if (fs.existsSync(path.join(root, projectName))) {
    try {
      const configFile = fs.readFileSync(
        path.join(root, projectName, 'config.json'),
        'utf8'
      );
      const config = JSON.parse(configFile);
      config.sequence = body.sequence || [];

      console.log(config.sequence)

      const browser = await puppeteer.launch({ headless: true });
      const flow = new Flow(config, browser, path.join(root, projectName));
      const page = await flow.navigateTo(config.rootUrl);
      const state = new State(page);
      // const state = undefined;

      console.log('running....')

      await page.setRequestInterception(true);

      await page.waitForNetworkIdle({ timeout: config.defaultTimeout });

      const runner = new Runner(config, flow, state);
      await runner.run(page, config.sequence);

      // log('Taking screenshot', 'yellow');
      await flow.discover(page, false);
      await flow.stateScreenshot(page, 'runstate');

      flow.export();

      res.status(200).send();
    } catch (err) {
      console.log('error')
      console.log(err);
      next(err)
    }
  }
});

const port = process.env.port || 3000;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
server.on('error', console.error);
