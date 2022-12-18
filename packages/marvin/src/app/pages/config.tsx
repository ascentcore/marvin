import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Grid } from '@mui/material';
import { SchemaForm } from '@ascentcore/react-schema-form';
import ConfigSchema from '../schemas/config.schema.json';
import {
  CustomWrapper,
  CustomRegistry,
} from '../components/custom.registry.schema.form';
import { ReactNode, useEffect } from 'react';

export interface ConfigProps {
  config: any;
  saveFile: Function;
}

export default function Config(props: ConfigProps) {
  const { config, saveFile, ...other } = props;

  const submit = (data: any) => {
    saveFile('config', data);
  };

  return (
    // <Grid container spacing={2}>
    <>
      <Typography variant="h6">{config.name}</Typography>
      <SchemaForm
        schema={ConfigSchema}
        wrapper={CustomWrapper as any}
        config={{ registry: CustomRegistry }}
        data={config}
        onSubmit={submit}
      />
    </>
    // </Grid>
  );
}
