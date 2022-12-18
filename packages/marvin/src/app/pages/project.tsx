// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react';
import { Models } from '@marvin/discovery';

import { useParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import FlowComponent from '../components/flow.component';
import TabPanel from '../components/tabpanel.component';
import Config from './config';
import Output from './output';
import { run } from 'node:test';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export function Project() {
  let { name } = useParams<{ name: string }>();

  const [config, setConfig] = React.useState<any>();
  const [flowModel, setFlowModel] = React.useState<Models.FlowModel>();
  const [output, setOutput] = React.useState<any>(null);
  const [value, setValue] = React.useState(1);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const loadOutput = () => {
    fetch(`http://localhost:3000/api/projects/${name}/output`)
      .then((data) => data.json())
      .then((data) => setOutput(data));
  };

  const loadFlow = () => {
    fetch(`http://localhost:3000/api/projects/${name}/flow`)
      .then((data) => data.json())
      .then((data) => setFlowModel(data));
  };

  useEffect(() => {
    loadFlow();
    loadOutput();
  }, []);

  useEffect(() => {
    fetch(`http://localhost:3000/api/projects/${name}/config`)
      .then((data) => data.json())
      .then((data) => setConfig(data));
  }, []);

  const saveFile = (file: string, data: any) => {
    fetch(`http://localhost:3000/api/projects/${name}/${file}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    })
      .then((response) => response.json())
      .then((data) => setConfig(data));
  };

  const run = (sequence: string[] = []) => {
    fetch(`http://localhost:3000/api/run/${name}`, {
      method: 'POST',
      body: JSON.stringify({ sequence }),
    }).then(() => loadOutput());
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Paper sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Config" />
              <Tab label="Discovery" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            {config && <Config config={config} saveFile={saveFile}></Config>}
          </TabPanel>
          <TabPanel value={value} index={1}>
            {output && <Output output={output} run={() => run()}></Output>}
          </TabPanel>
        </Paper>
      </Grid>
      <Grid item xs={6}>
        <Item>
          {config && flowModel && (
            <FlowComponent
              config={config}
              flowModel={flowModel}
              saveFile={saveFile}
            />
          )}
        </Item>
      </Grid>
    </Grid>
  );
}

export default Project;
