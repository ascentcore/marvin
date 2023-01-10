import Runner from '../../runner';
import Flow from '../../flow';
import { FlowModel } from '../../models/models';
import { Config } from '../../models/config';
import { State } from '../../state';
import * as puppeteer from 'puppeteer';

describe('Test Runer', () => {
  it('Template for runner tests', async () => {
    const config = {
      rootUrl: 'http://localhost:4200',
      defaultTimeout: 1000,
      path: 'output',
      aliases: {},
      sequence: ['Login as test user'],
    } as Config;
    const flowJSON = {
      actions: {
        'http://localhost:4200/': [
          {
            method: 'Login',
            sequence: [
              {
                type: 'fill',
                locator: 'input[placeholder="Enter username"]',
                uid: '9968ad96-ad4f-4c4c-8458-0130fe50848c',
              },
              {
                type: 'fill',
                locator: 'input[placeholder="Enter password"]',
                uid: '51533f8a-00ed-4f77-bf08-d97b36b4279e',
              },
              {
                type: 'click',
                locator: 'button',
                uid: '0368dc1d-986a-495c-91b1-d194ae1ab846',
              },
            ],
          },
        ],
      },
      graph: [
        {
          id: 'a011e499-cf83-47ad-807f-bd7efe351703',
          sequenceStep: 'Login as test user',
          parameters: {
            '9968ad96-ad4f-4c4c-8458-0130fe50848c': 'user@marvinapp.io',
            '51533f8a-00ed-4f77-bf08-d97b36b4279e': 'password123',
          },
          children: [],
          method: 'Login',
          url: 'http://localhost:4200/',
          exitUrl: 'http://localhost:4200/',
        },
      ],
    } as FlowModel;
    const browser = await puppeteer.launch({ headless: true });
    const flow = new Flow(config, browser);
    flow.flow = flowJSON;
    const page = await flow.navigateTo(config.rootUrl);
    const state = new State(page);
    await page.setRequestInterception(true);
    await page.waitForNetworkIdle({ timeout: config.defaultTimeout });
    const logSpy = jest.spyOn(global.console, 'log')
    const runner = new Runner(config, flow, state);
    await runner.run(page, config.sequence)
    expect(logSpy).toBeCalled();
    const msg: string = "Sequence ended on page: http://localhost:4200/";
    expect(logSpy).toContain(`[ marvin ] ${msg}`)
  });
});
