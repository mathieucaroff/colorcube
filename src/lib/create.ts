// function create()
// from
// https://github.com/mathieucaroff/xadom/blob/37570300c7/src/util/xaUtil.ts

/**
 * create an HTML Element
 *
 * @param name The html name of the element to create
 * @param attribute An object associating keys to values for the created element
 * @param children An array of children elements
 */
export function create<K extends keyof HTMLElementTagNameMap>(
  name: K,
  attribute: Partial<HTMLElementTagNameMap[K]> & Record<string, any> = {},
  children: Element[] = [],
): HTMLElementTagNameMap[K] {
  let elem = document.createElement<K>(name) as any

  Object.entries(attribute).forEach(([name, value]) => {
    if (elem[name] !== undefined) {
      elem[name] = value
    } else {
      elem.setAttribute(name, value)
    }
  })

  children.forEach((child) => {
    elem.appendChild(child)
  })

  return elem
}
