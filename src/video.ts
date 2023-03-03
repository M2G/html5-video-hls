import Hls from 'hls.js/dist/hls.min';
import { Level } from '../node_modules/hls.js/src/types/level.ts';
import './styles/style.scss';

import Component from './component';

const visibleClass = 'is-hidden';

const CLICK = 'click';

const defaults = {};

const hlsConfig = {
  debug: false,
  enableWorker: true,
  lowLatencyMode: true,
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

  for (let i = elms.length - 1; i >= 0; i--) {
    const child = i > 0 ? wrapper.cloneNode(true) : wrapper;
    const el = elms[i];

    const parent = el.parentNode;
    const sibling = el.nextSibling;

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
  private _levels: Level[] = [];
  private _firstLevel: number = -1;
  private _startLevel?: number;
  private currentLevelIndex: number = -1;
  private manualLevelIndex: number = -1;
  public constructor(elem: HTMLMediaElement, params: any) {
    super(Video, elem, params);

    if (!Hls.isSupported()) {
      console.error('Not supported');
      return;
    }

    const hls = new Hls(hlsConfig);
    hls.loadSource(url);
    hls.attachMedia(elem);

    const buttonAuto = document.createElement('button');
    buttonAuto.innerText = 'Auto';
    buttonAuto.dataset.id = String(-1);

    const videoWrapper = document.createElement('div');
    wrap(videoWrapper, elem);

    const div = document.createElement('div');
    div.id = 'qualityLevelControlTab';

    function getLevelButtonHtml(key, levels, autoEnabled) {
      console.log('hlsKey', hls[key]);
      console.log('autoEnabled', autoEnabled);
      for (let i = 0; i < levels.length; i += 1) {
        const enabled = hls[key] === i;
        if (div.children[i + 1]?.classList.contains('active')) {
          div.children[i + 1]?.classList.remove('active');
        }

        //console.log('autoEnabled', autoEnabled);
        //console.log('enabled', { enabled, i, hlsKey: hls[key], hls });

      /*  if (autoEnabled) {
          div.children[0]?.classList.add('active');
        }

        if (enabled) {
          div.children[0]?.classList.remove('active');
          div.children[i + 1]?.classList.add('active');
        }*/
      }
    }

    function updateLevelInfo() {
      const { levels, autoLevelEnabled } = hls;
      if (!levels) {
        return;
      }

      getLevelButtonHtml('currentLevel', levels, autoLevelEnabled);
    }

    hls.on(Hls.Events.LEVEL_SWITCHING, (eventName, data) => {
      updateLevelInfo();
    });

    hls.on(Hls.Events.MANIFEST_PARSED, (eventName, data) => {
      console.info(`${hls.levels.length} quality levels found`);
      console.info('Manifest successfully loaded');
      console.info({
        levelNb: data.levels.length,
        levelParsed: 0,
      });

      const { levels } = hls;
      if (!levels) {
        return;
      }

      const codecs = levels.reduce((uniqueCodecs, level) => {
        const levelCodecs = codecs2label(level.attrs.CODECS);
        if (levelCodecs && uniqueCodecs.indexOf(levelCodecs) === -1) {
          uniqueCodecs.push(levelCodecs);
        }
        return uniqueCodecs;
      }, []);

      /*
      buttonAuto.addEventListener('click', () => {
        hls.currentLevel = -1;
      });
      */

      div.appendChild(buttonAuto);
      videoWrapper.appendChild(div);

      console.log('levels', levels);

      for (let i = 0; i < levels.length; i += 1) {
        const label = level2label(levels[i], i, codecs);
        const buttonLevel = document.createElement('button');
        buttonLevel.innerText = label;
        buttonLevel.dataset.id = String(i);

        div.appendChild(buttonLevel);
        videoWrapper.appendChild(div);
      }

      /* div.addEventListener('click', (e: MouseEvent) => {
        const { id } = (e.target as HTMLButtonElement).dataset;

        console.log('-------------------------------------', id);

        hls.currentLevel = id;
      }); */
    });

    hls.on(Hls.Events.FRAG_BUFFERED, updateLevelInfo);
    hls.on(Hls.Events.LEVEL_SWITCHED, updateLevelInfo);
    hls.on(Hls.Events.FRAG_CHANGED, updateLevelInfo);
    hls.on(Hls.Events.FRAG_PARSING_METADATA, updateLevelInfo);
    hls.on(Hls.Events.ERROR, (eventName, data) => {
      console.warn('Error event:', data);
    });
  }

  private _registerListeners() {}

  private _unregisterListeners() {}

  public destroy() {}

  static get defaults() {
    return defaults;
  }

  static create(elem, options) {
    return super.create(this, elem, options);
  }

  destroy() {}

  qualityControl() {}
}

export default Video;
