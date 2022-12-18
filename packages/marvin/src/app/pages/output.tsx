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
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Stack } from '@mui/system';
import { ReactNode, useState, useEffect } from 'react';

export interface OutputProps {
  output: any;
  flow: any;
  run: Function;
  addAction: Function;
}

export function ItemsList(props: any) {
  const { items, selectItem } = props;
  return items.map((item: any) => (
    <Paper
      key={item.locator}
      sx={{ mt: 1, p: 1 }}
      elevation={2}
      onClick={() => selectItem(item.locator)}
    >
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
  const { output, flow, run, addAction } = props;

  const [route, setRoute] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [discoveredRoutes, setDiscoveredRoutes] = useState<any>([]);

  const [methodName, setMethodName] = useState<string | null>('');
  const [actions, setActions] = useState<any>([]);

  const handleClose = () => {
    setActions([]);
    setOpen(false);
  };

  const handleSave = () => {
    if (methodName && actions.length) {
      const action = {
        method: methodName,
        sequence: actions,
      };

      addAction(route, action);
      handleClose();

      console.log(action);
    }
  };

  useEffect(() => {
    const keys = Object.keys(output.discovered);
    console.log(keys)
    setDiscoveredRoutes(keys);
    if (keys && keys.length) {
      setRoute(keys[0]);
    }
  }, [output]);

  const handleChange = (event: any) => {
    setRoute(event.target.value);
  };

  const selectItem = (type: string) => (locator: any) => {
    setActions([...actions, { type, locator }]);
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
        <>
          <Grid item xs={12}>
            <Stack>
              <Typography variant="h6">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setOpen(true)}
                >
                  Define New Action
                </Button>
              </Typography>
              <Divider />
              {flow &&
                flow.actions &&
                flow.actions[route] &&
                flow.actions[route].length &&
                flow.actions[route].map((action: any, index: number) => (
                  <Chip
                    size="small"
                    sx={{ mr: 1, mt: 1 }}
                    label={
                      action.method +
                      ' (params:' +
                      action.sequence.filter((a: any) => a.type === 'fill')
                        .length +
                      ')'
                    }
                    variant="outlined"
                  />
                ))}
            </Stack>
          </Grid>

          <Dialog fullWidth={true} maxWidth="lg" open={open}>
            <DialogTitle>Add new action template</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    value={methodName}
                    variant="standard"
                    fullWidth={true}
                    onChange={(e) => setMethodName(e.target.value)}
                    label="Action Template Name"
                  />
                </Grid>
                <Grid item xs={6} lg={3}>
                  <Stack sx={{ maxHeight: '500px', overflow: 'auto' }}>
                    <Typography variant="h6">Info</Typography>
                    <ItemsList
                      items={output.discovered[route].items.info}
                      selectItem={selectItem('check')}
                    />
                    <Typography variant="h6">Input</Typography>
                    <ItemsList
                      items={output.discovered[route].items.input}
                      selectItem={selectItem('fill')}
                    />
                    <Typography variant="h6">Actions</Typography>
                    <ItemsList
                      items={output.discovered[route].items.actions}
                      selectItem={selectItem('click')}
                    />
                    <Typography variant="h6">Iterable</Typography>
                    <ItemsList
                      items={output.discovered[route].items.iterable}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={6} lg={9}>
                  {actions.length === 0 && (
                    <Typography sx={{ textAlign: 'center' }} variant="h6">
                      No actions defined. Please select discovered element
                    </Typography>
                  )}
                  {actions.length > 0 &&
                    actions.map((element: any, index: number) => (
                      <Grid key={index} container xs={12} spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            fullWidth={true}
                            variant="standard"
                            select
                            label="Type"
                            value={element.type}
                            onChange={(e) => {
                              const newActions = [...actions];
                              newActions[index].type = e.target.value;
                              setActions(newActions);
                            }}
                          >
                            <MenuItem value="fill">fill</MenuItem>
                            <MenuItem value="click">click</MenuItem>
                          </TextField>
                        </Grid>
                        <Grid item xs={8}>
                          <TextField
                            variant="standard"
                            fullWidth={true}
                            label="Locator"
                            value={element.locator}
                          />
                        </Grid>
                      </Grid>
                    ))}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button autoFocus onClick={handleClose} color="primary">
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Grid>
  );
}

/**
 * <Grid item xs={12}>
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
 */
