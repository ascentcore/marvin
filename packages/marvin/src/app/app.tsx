// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react';
import { Models } from '@marvin/discovery';
import FlowComponent from './components/flow.component';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { Stack, AppBar, Button, Toolbar, Typography } from '@mui/material';
import Project from './pages/project';

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export function App() {
  
  return (
    <>
      <AppBar position="static" color="primary" enableColorOnDark>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Marvin
          </Typography>
        </Toolbar>
      </AppBar>
      <Router>
        <Stack spacing={2} sx={{ flexGrow: 1 }} style={{ margin: 10 }}>
          <Routes>
            <Route path="/project/:name" element={<Project />} />
          </Routes>
        </Stack>
      </Router>
    </>
  );
}

export default App;
