# Polite Focus

A GNOME Shell extension. When a window asks for attention it comes to the front, the way it does on macOS, and **apps you mute are ignored completely**.

## Why

When an app wants the user to look at a window, GNOME doesn't raise it. That's focus-stealing prevention. Instead it shows a "“Window” is ready" notification, and you have to click the notification to see the window. Coming from macOS this feels backwards. You open a link, a dialog pops up, or you switch to an app, and you get a notification about it when you expected the window itself.

Extensions like [Steal My Focus](https://github.com/v-dimitrov/gnome-shell-extension-stealmyfocus) fix this by activating every window that asks for attention. The trouble is that it's all or nothing. Some apps ask for attention constantly in the background, like sync clients, updaters and some chat apps. They report progress nobody asked for, and with focus stealing turned on they keep yanking themselves in front of whatever you're working on.

Polite Focus does the same as Steal My Focus, plus a mute list:

| Window asks for attention | GNOME default | Steal My Focus | Polite Focus |
|---|---|---|---|
| Normal app | "… is ready" notification | Brought to front | Brought to front |
| Muted app | "… is ready" notification | Brought to front | **Nothing**: no focus, no notification |

## How it works

GNOME Shell handles the `window-demands-attention` and `window-marked-urgent` signals with its own `WindowAttentionHandler`, which posts the notification. While enabled, Polite Focus disconnects that handler and installs its own:

- windows that already have focus, or that are hidden from the taskbar, are left alone (the same rules the shell uses);
- windows of muted apps are ignored;
- everything else is activated with `Main.activateWindow`.

Disabling the extension reconnects the shell's original handler, so you get the stock behaviour back.

## Install

```sh
git clone https://github.com/jasperblues/gnome-polite-focus.git \
  ~/.local/share/gnome-shell/extensions/polite-focus@jasperblues.github.io
glib-compile-schemas ~/.local/share/gnome-shell/extensions/polite-focus@jasperblues.github.io/schemas
```

Log out and back in (GNOME on Wayland only discovers new extensions at login), then:

```sh
gnome-extensions enable polite-focus@jasperblues.github.io
```

If you use Steal My Focus, disable it. Both extensions handle the same signals.

Supports GNOME Shell 50 and 51.

## Muting an app

Muted apps are kept in the `muted-apps` setting. Each entry is matched as a case-insensitive substring of the window's **app id** (its `.desktop` file name) or **WM_CLASS**, with spaces ignored, so one short fragment of the name is usually enough.

To find an app's id: press Alt+F2, run `lg`, and open the **Windows** tab. Looking Glass lists each window's `wmclass` and `app`.

```sh
schemas=~/.local/share/gnome-shell/extensions/polite-focus@jasperblues.github.io/schemas

# Mute one or more apps (this replaces the list)
gsettings --schemadir $schemas set org.gnome.shell.extensions.polite-focus muted-apps "['examplesync', 'org.example.Updater']"

# Show the list
gsettings --schemadir $schemas get org.gnome.shell.extensions.polite-focus muted-apps
```

Changes apply immediately; there's no need to log out.

## Credits

The idea and the activation approach come from [Steal My Focus](https://github.com/v-dimitrov/gnome-shell-extension-stealmyfocus). Polite Focus is a from-scratch reimplementation that adds the mute list and restores the shell's own handler on disable.

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
