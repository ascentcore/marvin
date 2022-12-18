import {
  FormControl,
  Grid,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useState, useEffect } from 'react';

export interface OutputProps {
  output: any;
  run: Function;
}

export function ItemsList(props: any) {
  const { items } = props;
  return items.map((item: any) => (
    <Paper key={item.id} sx={{ mt: 1, p: 1 }} elevation={2}>
      <div>Text: {item.text && item.text != '' ? item.text : 'N/A'}</div>
      <Typography component="div" variant="caption">
        Details: {item.details}
      </Typography>
      <Typography component="div" variant="caption">
        Type: {item.type}
      </Typography>
      <Typography component="div" variant="caption">
        Locator: <Chip size="small" label={item.locator} />
      </Typography>
    </Paper>
  ));
}

export default function Config(props: OutputProps) {
  const { output, run } = props;

  const [route, setRoute] = useState<string | null>(null);
  const [discoveredRoutes, setDiscoveredRoutes] = useState<any>([]);

  useEffect(() => {
    const keys = Object.keys(output.discovered);
    setDiscoveredRoutes(keys);
    if (keys && keys.length) {
      setRoute(keys[0]);
    }
  }, [output]);

  const handleChange = (event: any) => {
    setRoute(event.target.value);
  };

  return (
    <Grid container spacing={2}>
      {discoveredRoutes && discoveredRoutes.length > 0 && (
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Route</InputLabel>
            <Select value={route} onChange={handleChange} label="route">
              {discoveredRoutes.map((route: any) => (
                <MenuItem key={route} value={route}>
                  {route}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
      {discoveredRoutes.length === 0 && (
        <Grid item xs={12}>
          <Button
            color="primary"
            fullWidth={true}
            onClick={() => {
              run();
            }}
          >
            Run Initial Discovery
          </Button>
        </Grid>
      )}
      {route && (
        <Grid item xs={12}>
          <Stack>
            <Typography variant="h6">Info</Typography>
            <ItemsList items={output.discovered[route].items.info} />
            <Typography variant="h6">Input</Typography>
            <ItemsList items={output.discovered[route].items.input} />
            <Typography variant="h6">Actions</Typography>
            <ItemsList items={output.discovered[route].items.actions} />
            <Typography variant="h6">Iterable</Typography>
            <ItemsList items={output.discovered[route].items.iterable} />
          </Stack>
        </Grid>
      )}
    </Grid>
  );
}
