import {
  Grid,
  TextField,
  Typography,
  Chip,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useState } from 'react';
export interface CustomProps {
  property: any;
  value: any;
  onChange: Function;
}

function Selectors(props: CustomProps) {
  const { property, value, onChange } = props;

  const [addValue, setAddValue] = useState('');

  const handleDelete = (index: number) => () => {
    const newValue = [...(value || [])];
    newValue.splice(index, 1);
    console.log(newValue);
    onChange(newValue);
  };

  const add = () => {
    if (addValue && addValue.trim().length > 0) {
      const newValue = [...(value || [])];
      newValue.push(addValue);
      setAddValue('');
      onChange(newValue);
    }
  };

  return (
    <Paper sx={{ p: 1 }}>
      <TextField
        fullWidth={true}
        value={addValue}
        variant="standard"
        onChange={(e) => setAddValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            add();
          }
        }}
        InputProps={{
          endAdornment: (
            <IconButton onClick={add}>
              <AddIcon />
            </IconButton>
          ),
        }}
        sx={{
          mb: 1,
          '& .Mui-focused .MuiIconButton-root': { color: 'primary.main' },
        }}
      />
      {value &&
        value.map((locator: string, index: number) => (
          <Chip
            size="small"
            sx={{ mr: 1 }}
            label={locator}
            variant="outlined"
            onDelete={handleDelete(index)}
          />
        ))}
    </Paper>
  );
}

function CustomTextField(props: CustomProps) {
  const { property, value, onChange } = props;
  const { type } = property;
  const handleChange = (event: any) => {
    onChange(event.target.value);
  };
  return (
    <TextField
      fullWidth={true}
      margin="none"
      value={value || ''}
      onChange={handleChange}
      error={!!property.error}
      variant="standard"
      type={type === 'integer' ? 'number' : 'text'}
      label={property.title}
      helperText={property.error ? property.error[0].keyword : ' '}
      required={property.isRequired}
    />
  );
}

export function CustomWrapper(props: any) {
  const { property, children } = props;
  const { type, title, description, $ref } = property;
  return (
    <Grid item xs={12}>
      {type === 'object' && (
        <>
          <Divider />
        </>
      )}
      {description && <Typography variant="body2">{description}</Typography>}
      {children}
    </Grid>
  );
}

export const CustomRegistry = {
  string: { component: CustomTextField },
  integer: { component: CustomTextField },
  selectors: { component: Selectors },
} as any;
