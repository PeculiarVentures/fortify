import * as React from 'react';
import { Button, Switch, Box } from 'lib-react-components';
import { intl } from '../../../main/locale';

const s = require('./styles/logging.sass');

interface ILoggingProps {
  name: any;
  logging: {
    onLoggingOpen: () => void;
    onLoggingStatusChange: () => void;
    status: boolean;
  };
}

export const Logging: React.SFC<ILoggingProps> = (props) => {
  const { logging } = props;

  return (
    <>
      <Box
        stroke="grey_2"
        fill="white"
        className={s.container_switch}
      >
        <Switch
          label={intl('enable.disable')}
          colorOn="secondary"
          color="grey_1"
          iconColor="grey_4"
          className={s.switch}
          labelProps={{
            type: 'b3',
          }}
          checked={logging.status}
          onCheck={logging.onLoggingStatusChange}
        />
      </Box>
      <Button
        size="large"
        color="secondary"
        onClick={logging.onLoggingOpen}
      >
        {intl('view.log')}
      </Button>
    </>
  );
};
