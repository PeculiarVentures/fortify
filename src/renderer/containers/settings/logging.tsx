import * as React from 'react';
import { Button, Switch, Box } from 'lib-react-components';

const s = require('./styles/logging.sass');

interface ILoggingProps {
  name: any;
}

// interface ILoggingState {}

// TODO: Need to add handler for enable/disable logs
// TODO: Use `Open log` from locale
export class Logging extends React.Component<ILoggingProps> {
  render() {
    return (
      <>
        <Box
          stroke="grey_2"
          fill="white"
          className={s.container_switch}
        >
          <Switch
            label="Enable logging"
            colorOn="secondary"
            color="grey_1"
            iconColor="grey_4"
            className={s.switch}
            labelProps={{
              type: 'b3',
            }}
          />
        </Box>
        <Button
          size="large"
          color="secondary"
        >
          Open log
        </Button>
      </>
    );
  }
}
