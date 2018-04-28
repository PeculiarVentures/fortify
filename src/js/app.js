import initSlider from './slider';

const FORTIFY_POOLING_DELAY = 5000;
const downloadForMac = document.getElementById(`download_mac`);
const downloadForWin32 = document.getElementById(`download_86`);
const downloadForWin64 = document.getElementById(`download_64`);
const downloadForLinux64 = document.getElementById(`download_linux_64`);

function createElement(tag = 'div', className = '', id, content = '', options = {}) {
  const element = document.createElement(tag);
  if (typeof content === 'string') {
    element.innerHTML = content;
  }
  if (content instanceof HTMLElement) {
    element.appendChild(content);
  }
  if (className) {
    element.className = className;
  }
  if (id) {
    element.id = id;
  }

  Object.keys(options).forEach(opt => (element[opt] = options[opt]));

  return element;
}

function createSVG(data) {
  return  `
    <svg xmlns="http://www.w3.org/2000/svg" class="${data.className}" viewBox="${data.viewBox}">
        <use xlink:href="#${data.id}"></use>
    </svg>
  `;
  const element = createElement('svg', data.className);
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');

  use.setAttribute('xlink:href', `#${data.id}`);
  element.setAttribute('viewBox', data.viewBox);

  element.appendChild(use);

  return element;
}

function findFortify() {
  return fetch('https://127.0.0.1:31337/.well-known/webcrypto-socket')
    .then(res => res.status === 200)
    .catch(err => false);
}

function defineMyCertificates() {
  const link = document.getElementById('certificates_link');

  if (link) {
    findFortify()
      .then((fortifyEnabled) => {
        if (fortifyEnabled) {
          link.classList.remove('m_hidden');
        } else {
          link.classList.add('m_hidden');
        }
      });
  }
}

function listenFortify() {
  defineMyCertificates();
  setTimeout(listenFortify, FORTIFY_POOLING_DELAY);
}

function getCardsData() {
  return fetch('https://raw.githubusercontent.com/PeculiarVentures/webcrypto-local/master/json/card.json')
    .then(res => res.json())
}

function prepareTableData(data) {
  console.log(data);
  if (!data) {
    return false;
  }
  return data.cards
    .sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    })
    .map(card => {
      const driver = data.drivers.filter(driver => driver.id === card.driver)[0];

      if (driver) {
        return {
          name: card.name,
          mac: !!(driver.file && driver.file.osx),
          win: !!(driver.file && driver.file.windows),
        };
      }
      return {
        name: card.name,
        mac: false,
        win: false,
      }
    });
}

function insertTableData(data) {
  const tableContainer = document.getElementById(`question-2`);

  const okData = {
    id: 'svg-checkmark',
    viewBox: '0 0 21 16',
    className: 'icon_ok',
  };

  const xData = {
    id: 'svg-cross',
    viewBox: '0 0 15 16',
    className: 'icon_x',
  };

  if (tableContainer && tableContainer.children[1]) {
    const container = createElement('div', 'table_container m_hidden');
    const btnHTMLOpen = `Click to show smart cards that are currently supported <svg class="toggle_arrow" viewBox="0 0 8 5">
        <path fill-rule="evenodd" d="M6.766566 1.710775l-2.53553 2.53553c-.390527.390527-1.023692.39052-1.414213 0L.281286 1.710766c-.390523-.390524-.390528-1.023686 0-1.414214C.468818.109023.723176.00366.98839.003666L6.05946.003663c.552285-.000007 1.000004.447712.999997.999998 0 .265223-.105352.519576-.29289.707115z"/>
      </svg>`;
    const btnHTMLClose = `Collapse table <svg class="toggle_arrow" viewBox="0 0 8 5">
        <path fill-rule="evenodd" d="M6.766566 1.710775l-2.53553 2.53553c-.390527.390527-1.023692.39052-1.414213 0L.281286 1.710766c-.390523-.390524-.390528-1.023686 0-1.414214C.468818.109023.723176.00366.98839.003666L6.05946.003663c.552285-.000007 1.000004.447712.999997.999998 0 .265223-.105352.519576-.29289.707115z"/>
      </svg>`;
    const button = createElement(
      'div',
      'toggle_button',
      null,
      btnHTMLOpen,
      {
        onclick: e => {
          if (container.classList.value.indexOf('m_hidden') === -1) {
            button.innerHTML = btnHTMLOpen;
          } else {
            button.innerHTML = btnHTMLClose;
          }
          container.classList.toggle('m_hidden');
          e.target.classList.toggle('m_hide');
        }
      },
    );
    const table = createElement('table', 'cards_table');
    container.appendChild(table);
    const head = createElement('thead');
    [
      createElement('th', 'cards_cell m_head', null, 'Card'),
      createElement('th', 'cards_cell m_head', null, 'Mac OS'),
      createElement('th', 'cards_cell m_head', null, 'Windows'),
    ].forEach(el => head.appendChild(el));

    const body = createElement('tbody');
    data.forEach(card => {
      const row = createElement('tr');
      row.appendChild(createElement('td', 'cards_cell', null, card.name));
      row.appendChild(createElement('td', 'cards_cell m_status', null, createSVG(card.mac ? okData: xData)));
      row.appendChild(createElement('td', 'cards_cell m_status', null, createSVG(card.win ? okData: xData)));
      body.appendChild(row);
    });

    table.appendChild(head);
    table.appendChild(body);

    tableContainer.children[1].appendChild(container);
    tableContainer.children[1].appendChild(button);
  }
}

function getFAQData() {
  let pathname = '/';
  if (/github\.io/.test(window.location.host)) {
    pahname = window.location.pathname;
  }
  return fetch(`${pathname}media/faq.json`)
    .then(res => res.json())
}

function insertFAQData(data) {
  const tableContainer = document.getElementById('faq_table');

  if (data && Array.isArray(data.questions)) {
    data.questions.forEach(pair => {
      const row = createElement('tr', 'row', `question-${pair.id}`);
      const question = createElement('td', 'cell m_question', null, pair.question);
      const answer = createElement('td', 'cell', null, pair.answer.replace(/\n/g, '<br>'));

      row.appendChild(question);
      row.appendChild(answer);

      tableContainer.appendChild(row);
    });
  }
}

function showAll() {
  downloadForMac.classList.remove('m_hidden', 'm_full_width');
  downloadForWin64.classList.remove('m_hidden', 'm_full_width');
  downloadForWin32.classList.remove('m_hidden', 'm_full_width');
  downloadForLinux64.classList.remove('m_hidden', 'm_full_width');
  document.getElementById('show_all').classList.add('m_hidden');
}

function detectOS() {
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  const showBtn = document.getElementById('show_all');

  if (platform.indexOf('Mac') !== -1) {
    downloadForWin32.classList.add('m_hidden');
    downloadForWin64.classList.add('m_hidden');
    downloadForLinux64.classList.add('m_hidden');
    downloadForMac.classList.add('m_full_width');
    showBtn.classList.remove('m_hidden');

  } else if (platform.indexOf('Win') !== -1 &&
    (userAgent.indexOf('WOW64') !== -1 || userAgent.indexOf('Win64') !== -1 )) {

    downloadForWin32.classList.add('m_hidden');
    downloadForMac.classList.add('m_hidden');
    downloadForLinux64.classList.add('m_hidden');
    downloadForWin64.classList.add('m_full_width');
    showBtn.classList.remove('m_hidden');

  } else if (platform.indexOf('Win') !== -1) {

    downloadForMac.classList.add('m_hidden');
    downloadForWin64.classList.add('m_hidden');
    downloadForLinux64.classList.add('m_hidden');
    downloadForWin32.classList.add('m_full_width');
    showBtn.classList.remove('m_hidden');

  } else if (platform.indexOf('Linux') !== -1) {

    downloadForMac.classList.add('m_hidden');
    downloadForWin64.classList.add('m_hidden');
    downloadForWin32.classList.add('m_hidden');
    downloadForLinux64.classList.add('m_full_width');
    showBtn.classList.remove('m_hidden');

  }

  showBtn.addEventListener('click', showAll, false);
}

function addLinks(assets) {

  for (let i = 0; i < assets.length; i += 1) {
    if (assets[i].name.indexOf('win32-x86') !== -1) {
      downloadForWin32.href = assets[i].browser_download_url;
      continue;
    }
    if (assets[i].name.indexOf('win32-x64') !== -1) {
      downloadForWin64.href = assets[i].browser_download_url;
      continue;
    }
    if (assets[i].name.indexOf('linux-x64') !== -1) {
      downloadForLinux64.href = assets[i].browser_download_url;
      continue;
    }
    if (assets[i].name.indexOf('mac') !== -1) {
      downloadForMac.href = assets[i].browser_download_url;
    }
  }
}

fetch('https://api.github.com/repos/PeculiarVentures/fortify-web/releases/latest', {
  method: 'GET'
}).then((response) => { return response.json() })
  .then((res) => addLinks(res.assets))
  .catch(err => {
    console.warn(err);
  });


detectOS();
initSlider();
listenFortify();
const cards = getCardsData()
  .then(prepareTableData);
const FAQ = getFAQData()
  .then(insertFAQData);

Promise.all([FAQ, cards])
  .then(([faq, cardsData]) => insertTableData(cardsData))
  .catch(err => {
    console.warn(err);
  });