/*eslint-disable*/
class Component {
  protected elem: any;
  /**
   * Generic constructor for all components
   * @constructor
   * @param ClassDef
   * @param elem
   * @param {Object} _
   */

  public constructor (ClassDef, elem, _) {
    if (!(elem instanceof Element)) {
      console.error(Error(`${elem} is not an HTML Element`));
    }

    this.elem = elem;
  }

  /**
   * Initializes components
   * @param ClassDef
   * @param elem
   * @param {Object} options
   */

  static create (ClassDef, elem, options) {
    let instances = null;
    if (elem instanceof Element) {
      instances = new ClassDef(elem, options);
    } else if (!!elem && elem instanceof NodeList) {
      const instancesArr: any[] | any = [];
      for (let i = 0; i < elem.length; i += 1) {
        instancesArr.push(new ClassDef(elem[i], options));
      }

      instances = instancesArr;
    }

    return instances;
  }
}

export default Component;
