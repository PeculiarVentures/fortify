import * as React from 'react';
import {
  Typography,
  Button,
  CircularProgress,
  Box,
} from 'lib-react-components';
import { GITHUB_REPO_LINK, DOWNLOAD_LINK } from '../../../main/constants';
import { IntlContext } from '../../components/intl';

const s = require('./styles/updates.sass');

interface IUpdatesProps {
  name: any;
  update: {
    isFetching: IsFetchingType;
    info?: UpdateInfoType;
  };
}

export class Updates extends React.Component<IUpdatesProps> {
  static contextType = IntlContext;

  context!: React.ContextType<typeof IntlContext>;

  renderChekingState() {
    const { intl } = this.context;

    return (
      <div className={s.container_cheking}>
        <CircularProgress
          style={{
            marginRight: '10px',
          }}
        />
        <Typography
          type="b3"
          color="grey_5_border"
        >
          {intl('updates.checking')}
        </Typography>
      </div>
    );
  }

  renderLatestVersionState() {
    const { intl } = this.context;

    return (
      <Typography
        type="b3"
        color="grey_5_border"
      >
        {intl('updates.latest')}
      </Typography>
    );
  }

  renderUpdateVersionState() {
    const { update } = this.props;
    const { intl } = this.context;

    return (
      <Box
        fill="white"
        borderRadius={3}
        className={s.container_update_available}
      >
        <Typography
          type="h5"
        >
          {intl('updates.available')}
        </Typography>
        <Typography
          type="c1"
          color="grey_4"
          className={s.description_update_available}
        >
          v{update.info?.version} ({new Date(update.info?.createdAt as any).toLocaleDateString()})
        </Typography>
        <div className={s.footer_update_available}>
          <Button
            bgType="clear"
            textColor="primary"
            size="small"
            style={{
              padding: '0px 5px',
              marginLeft: '-5px',
            }}
            href={`${GITHUB_REPO_LINK}/releases/tag/${update.info?.version}`}
          >
            {intl('updates.available.learn')}
          </Button>
          <Button
            size="large"
            color="secondary"
            href={DOWNLOAD_LINK}
          >
            {intl('download')}
          </Button>
        </div>
      </Box>
    );
  }

  render() {
    const { update } = this.props;

    if (update.isFetching === 'pending') {
      return this.renderChekingState();
    }

    if (update.info) {
      return this.renderUpdateVersionState();
    }

    return this.renderLatestVersionState();
  }
}
