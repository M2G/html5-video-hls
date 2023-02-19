import Video from './video';
import './index.scss';

const elem = document.getElementById('video');

if (elem) Video.create(elem, []);
