// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react';
import { Models } from '@marvin/discovery';
import styles from './app.module.scss';
import FlowComponent from './components/flow.component';

export function App() {
  const [flowModel, setFlowModel] = React.useState<Models.FlowModel>();

  useEffect(() => {
    fetch('http://localhost:3000/api/projects/test/flow')
      .then((data) => data.json())
      .then((data) => setFlowModel(data));
  }, []);

  return (
    <>
      {flowModel &&<FlowComponent flowModel={flowModel} />}
    </>
  );
}

export default App;
