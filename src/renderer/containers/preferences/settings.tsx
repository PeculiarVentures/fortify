import * as React from 'react';
import {
  Box,
  Typography,
  Select,
  SelectItem,
  Switch,
  Button,
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
    value: ('system' | 'dark' | 'light');
    onThemeChange: (theme: ('system' | 'dark' | 'light')) => void;
  };
}

export class Settings extends React.Component<ISettingsProps> {
  static contextType = IntlContext;

  context!: React.ContextType<typeof IntlContext>;

  handleChangeLanguage = (_: Event, value: string | number) => {
    const { language } = this.props;

    language.onLanguageChange(value as string);
  };

  handleChangeTheme = (_: Event, value: string | number) => {
    const { theme } = this.props;

    theme.onThemeChange(value as ('system' | 'dark' | 'light'));
  };

  render() {
    const { telemetry, logging, theme } = this.props;
    const { list, lang } = this.context;

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
            Language
          </Typography>
          <div className={s.actions}>
            <Select
              defaultValue={lang}
              size="large"
              bgType="stroke"
              color="grey_2"
              onChange={this.handleChangeLanguage}
            >
              {list.map((value) => {
                const isoLang = ISO_LANGS[value];

                return (
                  <SelectItem
                    key={value}
                    value={value}
                  >
                    {isoLang ? isoLang.nativeName : value}
                  </SelectItem>
                );
              })}
            </Select>
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
            Theme
          </Typography>
          <div className={s.actions}>
            <Select
              size="large"
              bgType="stroke"
              color="grey_2"
              defaultValue={theme.value}
              onChange={this.handleChangeTheme}
            >
              <SelectItem
                value="system"
              >
                Use system setting
              </SelectItem>
              <SelectItem
                value="light"
              >
                Light
              </SelectItem>
              <SelectItem
                value="dark"
              >
                Dark
              </SelectItem>
            </Select>
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
            Telemetry
          </Typography>
          <div className={s.actions}>
            <Switch
              colorOn="secondary"
              color="grey_1"
              iconColor="grey_4"
              label="Enable usage and crash reports to help us ensure future versions of Fortify address the issues you may experience"
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
            Logging
          </Typography>
          <div className={classnames(s.actions, s.m_alight)}>
            <Button
              bgType="clear"
              textColor="primary"
              size="small"
              style={{
                padding: '0px 5px',
              }}
              onClick={logging.onLoggingOpen}
            >
              View Log
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
