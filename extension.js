// Polite Focus: replaces GNOME Shell's window-attention handling.
//  - A window that asks for attention is activated, as on macOS, instead of
//    getting a "… is ready" notification.
//  - Windows of muted apps (the `muted-apps` setting) are ignored entirely:
//    no focus and no notification.
// SPDX-License-Identifier: GPL-3.0-or-later
import Shell from 'gi://Shell';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const normalize = s => s.toLowerCase().replace(/\s+/g, '');

export default class PoliteFocus extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._muted = [];
        const loadMuted = () => {
            this._muted = this._settings.get_strv('muted-apps').map(normalize).filter(Boolean);
        };
        this._settings.connectObject('changed::muted-apps', loadMuted, this);
        loadMuted();

        // Take over from the shell's own handler, which would otherwise post a notification first.
        global.display.disconnectObject(Main.windowAttentionHandler);
        const onAttention = (_display, window) => {
            if (!window || window.has_focus() || window.is_skip_taskbar() || this._isMuted(window))
                return;
            Main.activateWindow(window);
        };
        global.display.connectObject(
            'window-demands-attention', onAttention,
            'window-marked-urgent', onAttention,
            this);
    }

    disable() {
        global.display.disconnectObject(this);
        this._settings.disconnectObject(this);
        this._settings = null;

        // Restore GNOME's default notification behaviour.
        const shellHandler = Main.windowAttentionHandler;
        const handler = shellHandler._onWindowDemandsAttention.bind(shellHandler);
        global.display.connectObject(
            'window-demands-attention', handler,
            'window-marked-urgent', handler,
            shellHandler);
    }

    _isMuted(window) {
        if (this._muted.length === 0)
            return false;
        const app = Shell.WindowTracker.get_default().get_window_app(window);
        const ids = [app?.get_id(), window.get_wm_class(), window.get_wm_class_instance()]
            .filter(Boolean)
            .map(normalize);
        return this._muted.some(m => ids.some(id => id.includes(m)));
    }
}
