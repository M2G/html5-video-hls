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

    const button = document.createElement('button');
    button.innerText = 'Auto';

    function removeAllChildNodes(parent) {
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    }

    const videoWrapper = document.createElement('div');
    wrap(videoWrapper, elem);

    const div = document.createElement('div');
    div.id = "qualityLevelControlTab";

    function getLevelButtonHtml(key, levels, onclickReplace, autoEnabled) {
      // const onclickAuto = `${key}=-1`.replace(/^(\w+)=([^=]+)$/, onclickReplace);
      const codecs = levels.reduce((uniqueCodecs, level) => {
        const levelCodecs = codecs2label(level.attrs.CODECS);
        if (levelCodecs && uniqueCodecs.indexOf(levelCodecs) === -1) {
          uniqueCodecs.push(levelCodecs);
        }
        return uniqueCodecs;
      }, []);


      button.addEventListener('click', () => {
        console.log('addEventListener');
        hls.currentLevel = -1;
      });

      div.appendChild(button);
      videoWrapper.appendChild(div);


      levels.map((level, i) => {
        const enabled = hls[key] === i;
        const label = level2label(levels[i], i, codecs);
        const button2 = document.createElement('button');
        button2.addEventListener('click', () => {
          console.log('addEventListener');
          hls.currentLevel = i;
        });
        button2.innerText = label;
      });

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

      /*if (document.querySelector('#currentLevelControl').innerHTML !== htmlCurrentLevel) {
        document.querySelector('#currentLevelControl').innerHTML = htmlCurrentLevel;
      }*/
    }

    hls.on(Hls.Events.LEVEL_SWITCHING, (eventName, data) => {
      console.log(Hls.Events.LEVEL_SWITCHING, {
        id: data.level,
        bitrate: Math.round(hls.levels[data.level].bitrate / 1000),
      });
      updateLevelInfo();
    });

    hls.on(Hls.Events.MANIFEST_PARSED, (eventName, data) => {
      console.log(`${hls.levels.length} quality levels found`);
      console.log('Manifest successfully loaded');
      updateLevelInfo();
    });

    hls.on(Hls.Events.FRAG_BUFFERED, (eventName, data) => {
      updateLevelInfo();
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, (eventName, data) => {
      updateLevelInfo();
    });

    hls.on(Hls.Events.FRAG_CHANGED, (eventName, data) => {
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
