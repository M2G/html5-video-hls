import Hls from 'hls.js/dist/hls.min';
import { Events } from 'hls.js/src/events';
import type { Level } from 'hls.js/src/types/level';
import type { LevelSwitchingData, ErrorData, ManifestLoadedData } from 'hls.js/src/types/events';
import Component from './component';
import './styles/style.scss';

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
function wrap(wrapper: HTMLDivElement, elms: any[] | string) {
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

function codecs2label(levelCodecs: string) {
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
  private hls: any;

  private div: HTMLDivElement;
  private currentLevel: number;

  public constructor(elem: HTMLMediaElement, params: any) {
    super(Video, elem, params);

    if (!Hls.isSupported()) {
      console.error('Not supported');
      return;
    }

    this.currentLevel = null;
    this.elem = elem;
    this.hls = new Hls(hlsConfig);
    this.hls.loadSource(url);
    this.hls.attachMedia(elem);

    this.#registerListeners();
  }

  static create(elem: HTMLElement, options: never[]) {
    return super.create(this, elem, options);
  }

  public destroy() {
    this.#unregisterListeners();
  }

  static get defaults() {
    return defaults;
  }

  private #registerListeners() {
    this.hls.on(Events.MANIFEST_PARSED, this.onManifestLoaded.bind(this));
    this.hls.on(Events.LEVEL_SWITCHING, this.onLevelSwitching.bind(this));
    this.hls.on(Events.LEVEL_SWITCHED, this.onLevelSwitched.bind(this));
    this.hls.on(Events.ERROR, this.onError.bind(this));

    console.log('---------', this.elem);
  }

  private #unregisterListeners() {
    this.hls.off(Events.MANIFEST_PARSED, this.onManifestLoaded.bind(this));
    this.hls.off(Events.LEVEL_SWITCHING, this.onLevelSwitching.bind(this));
    this.hls.off(Events.LEVEL_SWITCHED, this.onLevelSwitched.bind(this));
    this.hls.off(Events.ERROR, this.onError.bind(this));
  }

  protected onLevelSwitched(event: Events.LEVEL_SWITCHED, data: LevelSwitchingData): void {
    const { currentLevel }: { currentLevel: number } = this.hls;

    console.log('level level level 1', this.currentLevel);
    this.currentLevel = currentLevel;
    console.log('level level level 2', this.currentLevel);
    console.log('hls.currentLevel AFTER', currentLevel);
    this.div.children[currentLevel + 1]?.classList.add('active');
  }

  protected onLevelSwitching(event: Events.LEVEL_SWITCHING, data: LevelSwitchingData): void {
    const { autoLevelEnabled, currentLevel }: { autoLevelEnabled: string; currentLevel: number } =
      this.hls;

    console.log('updateLevelInfo', { autoLevelEnabled, currentLevel });

    if (autoLevelEnabled) {
      this.div.children[0]?.classList.add('active');
      return;
    }

    this.div.children[0]?.classList.remove('active');
    console.log('hls.currentLevel BEFORE', currentLevel);

    if (this.div.children[currentLevel + 1]?.classList.contains('active')) {
      this.div.children[currentLevel + 1]?.classList.remove('active');
    }
  }

  protected onError(event: Events.ERROR, data: ErrorData): void {
    console.warn(Events.ERROR, data);
  }

  protected onManifestLoaded(event: Events.MANIFEST_LOADED, data: ManifestLoadedData): void {
    const { levels } = this.hls;
    if (!levels) {
      return;
    }

    const buttonAuto = document.createElement('button');
    buttonAuto.innerText = 'Auto';
    buttonAuto.dataset.id = String(-1);

    const videoWrapper = document.createElement('div');
    wrap(videoWrapper, this.elem);

    this.div = document.createElement('div');

    const codecs = levels.reduce(
      (
        uniqueCodecs: string[] | readonly string[],
        level: { readonly attrs: { readonly CODECS: string } }
      ) => {
        const levelCodecs: string = codecs2label(level.attrs.CODECS);
        if (uniqueCodecs?.includes(levelCodecs)) {
          uniqueCodecs.push(levelCodecs);
        }
        return uniqueCodecs;
      },
      []
    );

    buttonAuto.addEventListener(CLICK, () => {
      this.hls.currentLevel = -1;
    });

    this.div.appendChild(buttonAuto);
    videoWrapper.appendChild(this.div);

    console.log('levels', levels);

    for (let i = 0; i < levels.length; i += 1) {
      const label = level2label(levels[i], i, codecs);
      const buttonLevel = document.createElement('button');
      buttonLevel.innerText = label;
      buttonLevel.dataset.id = String(i);

      this.div.appendChild(buttonLevel);

      // @TODO temparally, i will create programmatically, video control
      document.querySelector('#quality-control').appendChild(this.div);
    }

    this.div.addEventListener(CLICK, (e: MouseEvent) => {
      const { id } = (e.target as HTMLButtonElement).dataset;
      this.hls.currentLevel = Number(id);
    });
  }
}

export default Video;
