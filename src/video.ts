import Hls from 'hls.js/dist/hls.min';
import './styles/style.scss';

import Component from './component';

const visibleClass = 'is-hidden';

const CLICK = 'click';

const defaults = {};

const hlsConfig = {
  debug: true,
  enableWorker: true,
};

const url = 'http://sample.vodobox.com/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8';

/**
 * Wrap an HTMLElement around each element in a list of elements
 * Modified global function based on Kevin Jurkowski's implementation
 * here: http://stackoverflow.com/questions/3337587/wrapping-a-dom-element-using-pure-javascript/13169465#13169465
 */
function wrap(wrapper, elms) {
  if (!elms.length) {
    elms = [elms];
  }

  for (var i = elms.length - 1; i >= 0; i--) {
    var child = i > 0 ? wrapper.cloneNode(true) : wrapper;
    var el = elms[i];

    var parent = el.parentNode;
    var sibling = el.nextSibling;

    child.appendChild(el);

    if (sibling) {
      parent.insertBefore(child, sibling);
    } else {
      parent.appendChild(child);
    }
  }
}

function codecs2label(levelCodecs) {
  if (levelCodecs) {
    return levelCodecs.replace(/([ah]vc.)[^,;]+/, '$1').replace('mp4a.40.2', 'mp4a');
  }
  return '';
}

function level2label(level, i, manifestCodecs) {
  const levelCodecs = codecs2label(level.attrs.CODECS);
  const levelNameInfo = level.name ? `"${level.name}": ` : '';
  const codecInfo = levelCodecs && manifestCodecs.length > 1 ? ` / ${levelCodecs}` : '';
  if (level.height) {
    return `${i} (${levelNameInfo}${level.height}p / ${Math.round(
      level.bitrate / 1024
    )}kb${codecInfo})`;
  }
  if (level.bitrate) {
    return `${i} (${levelNameInfo}${Math.round(level.bitrate / 1024)}kb${codecInfo})`;
  }
  if (codecInfo) {
    return `${i} (${levelNameInfo}${levelCodecs})`;
  }
  if (level.name) {
    return `${i} (${level.name})`;
  }
  return `${i}`;
}

class Video extends Component {
  public constructor(elem, params) {
    super(Video, elem, params);
    console.log('video', elem);

    if (!Hls.isSupported()) {
      console.error('Not supported');
      return;
    }

    const hls = new Hls(hlsConfig);

    console.log('hls', hls);

    hls.loadSource(url);
    hls.attachMedia(elem as HTMLMediaElement);

    const buttonAuto = document.createElement('button');
    buttonAuto.innerText = 'Auto';
    buttonAuto.dataset.id = String(-1);

    const videoWrapper = document.createElement('div');
    wrap(videoWrapper, elem);

    const div = document.createElement('div');
    div.id = 'qualityLevelControlTab';

    function getLevelButtonHtml(key, levels, onclickReplace, autoEnabled) {
      /*
        `<button type="button" class="btn btn-sm ${
          autoEnabled ? 'btn-primary' : 'btn-success'
        }" onclick="${onclickAuto}">auto</button>` +
        levels
          .map((level, i) => {
            const enabled = hls[key] === i;
            const onclick = `${key}=${i}`.replace(/^(\w+)=(\w+)$/, onclickReplace);

            console.log('onclick', onclick)

            const label = level2label(levels[i], i, codecs);

            console.log('label', label)

            return `<button type="button" class="btn btn-sm ${
              enabled ? 'btn-primary' : 'btn-success'
            }" onclick="${onclick}">${label}</button>`;
          })
          .join('')
      ); */
    }

    function updateLevelInfo() {
      const { levels } = hls;
      if (!levels) {
        return;
      }

      const htmlCurrentLevel = getLevelButtonHtml(
        'currentLevel',
        levels,
        'hls.$1=$2',
        hls.autoLevelEnabled
      );

      console.log('htmlCurrentLevel htmlCurrentLevel', htmlCurrentLevel);
    }

    hls.on(Hls.Events.LEVEL_SWITCHING, (eventName, data) => {
      console.log('LEVEL_SWITCHING');
      updateLevelInfo();
    });

    hls.on(Hls.Events.MANIFEST_PARSED, (eventName, data) => {
      const { levels } = hls;
      if (!levels) {
        return;
      }

      console.log('MANIFEST_PARSED');

      const key = 'currentLevel';

      const codecs = levels.reduce((uniqueCodecs, level) => {
        const levelCodecs = codecs2label(level.attrs.CODECS);
        if (levelCodecs && uniqueCodecs.indexOf(levelCodecs) === -1) {
          uniqueCodecs.push(levelCodecs);
        }
        return uniqueCodecs;
      }, []);

      buttonAuto.addEventListener('click', () => {
        console.log('addEventListener');
        hls.currentLevel = -1;
      });

      div.appendChild(buttonAuto);
      videoWrapper.appendChild(div);

      levels.map((level, i) => {
        const enabled = hls[key] === i;
        const label = level2label(levels[i], i, codecs);
        const buttonLevel = document.createElement('button');
        buttonLevel.innerText = label;
        buttonLevel.dataset.id = i;
        /*
        buttonLevel.addEventListener('click', () => {
          console.log('addEventListener');
          hls.currentLevel = i;
        });
        */

        console.log('buttonLevel', div);

        div.appendChild(buttonLevel);
        videoWrapper.appendChild(div);

        updateLevelInfo();
      });

      div.addEventListener('click', ({target}) => {
        console.log('addEventListener', target.dataset.id);
        hls.currentLevel = target.dataset.id;
      });

      console.log('-----------------', hls[key]);

    });

    hls.on(Hls.Events.FRAG_BUFFERED, (eventName, data) => {
      console.log('FRAG_BUFFERED');
      updateLevelInfo();
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (eventName, data) => {
      console.log('LEVEL_SWITCHED');
      updateLevelInfo();
    });

    hls.on(Hls.Events.FRAG_CHANGED, (eventName, data) => {
      console.log('FRAG_CHANGED');
      updateLevelInfo();
    });
  }

  static get defaults() {
    return defaults;
  }

  static create(elem, options) {
    return super.create(this, elem, options);
  }
}

export default Video;
