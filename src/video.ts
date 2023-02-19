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

const url = 'http://amssamples.streaming.mediaservices.windows.net/634cd01c-6822-4630-8444-8dd6279f94c6/CaminandesLlamaDrama4K.ism/manifest(format=m3u8-aapl)';

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


    function getLevelButtonHtml(key, levels, onclickReplace, autoEnabled) {
      const onclickAuto = `${key}=-1`.replace(/^(\w+)=([^=]+)$/, onclickReplace);
      const codecs = levels.reduce((uniqueCodecs, level) => {
        const levelCodecs = codecs2label(level.attrs.CODECS);
        if (levelCodecs && uniqueCodecs.indexOf(levelCodecs) === -1) {
          uniqueCodecs.push(levelCodecs);
        }
        return uniqueCodecs;
      }, []);
      return (
        `<button type="button" class="btn btn-sm ${
          autoEnabled ? 'btn-primary' : 'btn-success'
        }" onclick="${onclickAuto}">auto</button>` +
        levels
          .map((level, i) => {
            const enabled = hls[key] === i;
            const onclick = `${key}=${i}`.replace(/^(\w+)=(\w+)$/, onclickReplace);
            const label = level2label(levels[i], i, codecs);
            return `<button type="button" class="btn btn-sm ${
              enabled ? 'btn-primary' : 'btn-success'
            }" onclick="${onclick}">${label}</button>`;
          })
          .join('')
      );
    }

    function updateLevelInfo() {
      const {levels} = hls;
      if (!levels) {
        return;
      }

      const htmlCurrentLevel = getLevelButtonHtml(
        'currentLevel',
        levels,
        'hls.$1=$2',
        hls.autoLevelEnabled
      );
      const htmlNextLevel = getLevelButtonHtml('nextLevel', levels, 'hls.$1=$2', hls.autoLevelEnabled);
      const htmlLoadLevel = getLevelButtonHtml('loadLevel', levels, 'hls.$1=$2', hls.autoLevelEnabled);

      if (document.querySelector('#currentLevelControl').innerHTML !== htmlCurrentLevel) {
        console.log('zzzzzzzz', document.querySelector('#currentLevelControl'))

        document.querySelector('#currentLevelControl').innerHTML = htmlCurrentLevel;
      }

      if (document.querySelector('#nextLevelControl').innerHTML !== htmlNextLevel) {
        document.querySelector('#nextLevelControl').innerHTML = htmlNextLevel;
      }

      if (document.querySelector('#loadLevelControl').innerHTML !== htmlLoadLevel) {
        document.querySelector('#loadLevelControl').innerHTML = htmlLoadLevel;
      }
    }

    hls.on(Hls.Events.LEVEL_SWITCHING, function (eventName, data) {
      console.log(Hls.Events.LEVEL_SWITCHING, {
        id: data.level,
        bitrate: Math.round(hls.levels[data.level].bitrate / 1000),
      });
      updateLevelInfo();
    });

    hls.on(Hls.Events.MANIFEST_PARSED, function (eventName, data) {
      console.log(`${hls.levels.length} quality levels found`);
      console.log('Manifest successfully loaded');
      updateLevelInfo();
    });

    hls.on(Hls.Events.FRAG_BUFFERED, function (eventName, data) {
      updateLevelInfo();
    });

    hls.on(Hls.Events.LEVEL_SWITCHED, function (eventName, data) {
      updateLevelInfo();
    });

    hls.on(Hls.Events.FRAG_CHANGED, function (eventName, data) {
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
