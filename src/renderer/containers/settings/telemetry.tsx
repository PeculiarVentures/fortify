import * as React from 'react';
import { Switch, Box } from 'lib-react-components';
import { IntlContext } from '../../components/intl';

const s = require('./styles/logging.sass');

interface ITelemetryProps {
  name: any;
  telemetry: {
    onTelemetryStatusChange: () => void;
    status: boolean;
  };
}

export class Telemetry extends React.Component<ITelemetryProps> {
  static contextType = IntlContext;

  render() {
    const { telemetry } = this.props;
    const { intl } = this.context;

    return (
      <>
        <Box
          stroke="grey_2"
          fill="white"
          className={s.container_switch}
        >
          <Switch
            label={intl('telemetry.enable')}
            colorOn="secondary"
            color="grey_1"
            iconColor="grey_4"
            className={s.switch}
            labelProps={{
              type: 'b3',
            }}
            checked={telemetry.status}
            onCheck={telemetry.onTelemetryStatusChange}
          />
        </Box>
      </>
    );
  }
}
