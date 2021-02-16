import * as React from 'react';
import {
  Box,
  Typography,
  Select,
  Switch,
  Button,
  SelectChangeEvent,
} from 'lib-react-components';
import classnames from 'classnames';
import { IntlContext } from '../../components/intl';
import { ISO_LANGS } from '../../conts';

const s = require('./styles/settings.sass');

interface ISettingsProps {
  name: any;
  language: {
    onLanguageChange: (lang: string) => void;
  };
  logging: {
    onLoggingOpen: () => void;
    onLoggingStatusChange: () => void;
    status: boolean;
  };
  telemetry: {
    onTelemetryStatusChange: () => void;
    status: boolean;
  };
  theme: {
    value: ThemeType;
    onThemeChange: (theme: ThemeType) => void;
  };
}

export class Settings extends React.Component<ISettingsProps> {
  static contextType = IntlContext;

  context!: React.ContextType<typeof IntlContext>;

  handleChangeLanguage = (event: SelectChangeEvent) => {
    const { language } = this.props;
    const { value } = event.target;

    language.onLanguageChange(value as string);
  };

  handleChangeTheme = (event: SelectChangeEvent) => {
    const { theme } = this.props;
    const { value } = event.target;

    theme.onThemeChange(value as ThemeType);
  };

  render() {
    const { telemetry, logging, theme } = this.props;
    const { list, lang, intl } = this.context;

    return (
      <>
        <Box
          fill="white"
          borderRadius={3}
          className={s.item}
        >
          <Typography
            type="b3"
          >
            {intl('language')}
          </Typography>
          <div className={s.actions}>
            <Select
              defaultValue={lang}
              size="large"
              bgType="stroke"
              color="grey_2"
              onChange={this.handleChangeLanguage}
              options={list.map((value) => {
                const isoLang = ISO_LANGS[value];

                return {
                  value,
                  label: isoLang ? isoLang.nativeName : value,
                };
              })}
            />
          </div>
        </Box>

        <Box
          fill="white"
          borderRadius={3}
          className={s.item}
        >
          <Typography
            type="b3"
          >
            {intl('theme')}
          </Typography>
          <div className={s.actions}>
            <Select
              size="large"
              bgType="stroke"
              color="grey_2"
              defaultValue={theme.value}
              onChange={this.handleChangeTheme}
              options={['system', 'light', 'dark'].map((value) => ({
                value,
                label: intl(`theme.${value}`),
              }))}
            />
          </div>
        </Box>

        <Box
          fill="white"
          borderRadius={3}
          className={s.item}
        >
          <Typography
            type="b3"
          >
            {intl('telemetry')}
          </Typography>
          <div className={s.actions}>
            <Switch
              colorOn="secondary"
              color="grey_1"
              iconColor="grey_4"
              label={intl('telemetry.enable')}
              labelProps={{
                type: 'c1',
                color: 'grey_4',
              }}
              style={{
                width: '100%',
              }}
              checked={telemetry.status}
              onCheck={telemetry.onTelemetryStatusChange}
            />
          </div>
        </Box>

        <Box
          fill="white"
          borderRadius={3}
          className={s.item}
        >
          <Typography
            type="b3"
          >
            {intl('logging')}
          </Typography>
          <div className={classnames(s.actions, s.m_alight)}>
            <Button
              bgType="clear"
              textColor="primary"
              size="small"
              style={{
                padding: '0px 5px',
                marginLeft: '-5px',
              }}
              onClick={logging.onLoggingOpen}
            >
              {intl('view.log')}
            </Button>
            <Switch
              colorOn="secondary"
              color="grey_1"
              iconColor="grey_4"
              checked={logging.status}
              onCheck={logging.onLoggingStatusChange}
            />
          </div>
        </Box>
      </>
    );
  }
}
