import * as React from 'react';
import {
  Typography,
  Button,
  CircularProgress,
  Box,
} from 'lib-react-components';
import { GITHUB_REPO_LINK, DOWNLOAD_LINK } from '../../../main/constants';

const s = require('./styles/updates.sass');

interface IUpdatesProps {
  name: any;
  update: {
    isFetching: IsFetchingType;
    info?: UpdateInfoType;
  };
}

export class Updates extends React.Component<IUpdatesProps> {
  // eslint-disable-next-line class-methods-use-this
  renderChekingState() {
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
          Cheking for updates
        </Typography>
      </div>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  renderLatestVersionState() {
    return (
      <Typography
        type="b3"
        color="grey_5_border"
      >
        You&apos;re on the latest version of Fortify.
      </Typography>
    );
  }

  renderUpdateVersionState() {
    const { update } = this.props;

    return (
      <Box
        fill="white"
        borderRadius={3}
        className={s.container_update_available}
      >
        <Typography
          type="h5"
        >
          A new update is available.
        </Typography>
        <Typography
          type="c1"
          color="grey_4"
          className={s.description_update_available}
        >
          v{update.info?.version} from {new Date(update.info?.createdAt as any).toLocaleDateString()}
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
            Learn more about this update
          </Button>
          <Button
            size="large"
            color="secondary"
            href={DOWNLOAD_LINK}
          >
            Download
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
