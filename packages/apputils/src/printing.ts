/**
 * Any object is "printable" if it implements the `IPrintable` interface.
 *
 * To do this it, it must have a method called `Printing.symbol` which returns either a function
 * to print the object or null if it cannot be printed.
 *
 * One way of printing is to use the `printWidget` function, which creates a hidden iframe
 * and copies the DOM nodes from your widget to that iframe and printing just that iframe.
 *
 * Another way to print is to use the `printURL` function, which takes a URL and prints that page.
 */

import { Widget } from '@phosphor/widgets';
import { ServerConnection } from '@jupyterlab/services';

export namespace Printing {
  /**
   * Function that takes no arguments and when invoked prints out some object or null if printing is not defined.
   */
  export type OptionalAsyncThunk = () => Promise<void> | null;

  /**
   * Symbol to use for a method that returns a function to print an object.
   */
  export const symbol = Symbol('printable');

  /**
   * Objects who provide a custom way of printing themselves
   * should implement this interface.
   */
  export interface IPrintable {
    /**
     * Returns a function to print this object or null if it cannot be printed.
     */
    [symbol]: () => OptionalAsyncThunk;
  }

  /**
   * Returns whether an object implements a print method.
   */
  export function isPrintable(a: unknown): a is IPrintable {
    if (typeof a !== 'object' || !a) {
      return false;
    }
    return symbol in a;
  }

  /**
   * Returns the print function for an object, or null if it does not provide a handler.
   */
  export function getPrintFunction(val: unknown): OptionalAsyncThunk {
    if (isPrintable(val)) {
      return val[symbol]();
    }
    return null;
  }

  /**
   * Prints a widget by copying it's DOM node
   * to a hidden iframe and printing that iframe.
   */
  export function printWidget(widget: Widget): Promise<void> {
    return printElement(widget.node);
  }

  const settings = ServerConnection.makeSettings();
  /**
   * Prints a URL by loading it into an iframe.
   *
   * @param url URL to load into an iframe.
   */
  export async function printURL(url: string): Promise<void> {
    const text = await (await ServerConnection.makeRequest(
      url,
      {},
      settings
    )).text();
    return printContent(text);
  }

  /**
   * Prints an element by copying it into an iframe.
   */
  export function printElement(el: HTMLElement): Promise<void> {
    return printContent(parent => parent.appendChild(el.cloneNode(true)));
  }
  /**
   * Prints a URL or an callback that sets a node element in an iframe and then removes the iframe after printing.
   */
  export async function printContent(
    textOrCallback: string | ((el: HTMLElement) => void)
  ): Promise<void> {
    const iframe = createIFrame();
    let loaded = resolveWhenLoaded(iframe);
    const parent = window.document.body;
    parent.appendChild(iframe);
    if (typeof textOrCallback === 'string') {
      iframe.srcdoc = textOrCallback as string;
    } else {
      iframe.src = 'about:blank';
      await loaded;
      textOrCallback(iframe.contentDocument.body);
      iframe.contentDocument.close();
    }
    await loaded;
    console.log('new new', iframe);
    const printed = resolveAfterEvent();
    launchPrint(iframe.contentWindow);
    // Once the print dialog has been dismissed, we regain event handling,
    // and it should be safe to discard the hidden iframe.
    await printed;
    // parent.removeChild(iframe);
  }

  /**
   * Creates a new hidden iframe and appends it to the document
   *
   * Modified from
   * https://github.com/joseluisq/printd/blob/eb7948d602583c055ab6dee3ee294b6a421da4b6/src/index.ts#L24
   */
  function createIFrame(): HTMLIFrameElement {
    const el = window.document.createElement('iframe');

    // We need both allow-modals and allow-same-origin to be able to
    // call print in the iframe.
    // We intentionally do not allow scripts:
    // https://github.com/jupyterlab/jupyterlab/pull/5850#pullrequestreview-230899790
    el.setAttribute('sandbox', 'allow-modals allow-same-origin');
    const css =
      'visibility:hidden;width:0;height:0;position:absolute;z-index:-9999;bottom:0;';
    el.setAttribute('style', css);
    el.setAttribute('width', '0');
    el.setAttribute('height', '0');

    return el;
  }

  /**
   * Promise that resolves when all resources are loaded in the window.
   */
  function resolveWhenLoaded(iframe: HTMLIFrameElement): Promise<void> {
    return new Promise(resolve => {
      iframe.onload = () => resolve();
    });
  }

  /**
   * A promise that resolves after the next mousedown, mousemove, or
   * keydown event. We use this as a proxy for determining when the
   * main window has regained control after the print dialog is removed.
   *
   * We can't use the usual window.onafterprint handler because we
   * disallow Javascript execution in the print iframe.
   */
  function resolveAfterEvent(): Promise<void> {
    return new Promise(resolve => {
      const onEvent = () => {
        document.removeEventListener('mousemove', onEvent, true);
        document.removeEventListener('mousedown', onEvent, true);
        document.removeEventListener('keydown', onEvent, true);
        resolve();
      };
      document.addEventListener('mousemove', onEvent, true);
      document.addEventListener('mousedown', onEvent, true);
      document.addEventListener('keydown', onEvent, true);
    });
  }

  /**
   * Prints a content window.
   */
  function launchPrint(contentWindow: Window) {
    const result = contentWindow.document.execCommand('print', false, null);
    // execCommand won't work in firefox so we call the `print` method instead if it fails
    // https://github.com/joseluisq/printd/blob/eb7948d602583c055ab6dee3ee294b6a421da4b6/src/index.ts#L148
    if (!result) {
      contentWindow.print();
    }
  }
}
