# Php Array Symbol Provider

Other extensions can access the parsed array keys through the activation API:

```ts
const api = await vscode.extensions.getExtension('ctf0.php-array-symbols')?.activate()
const document = vscode.window.activeTextEditor?.document
const line = vscode.window.activeTextEditor?.selection.active.line

const keys = document ? api?.getSymbolKeys(document) ?? [] : []
const currentKey = document && line !== undefined ? api?.getSymbolKeyAtLine(document, line) : undefined
```

The exposed methods are:

- `getSymbolKeys(document): string[]` returns every parsed key. Nested keys use dot notation, such as `connections.pusher.driver`.
- `getSymbolKeyAtLine(document, line): string | undefined` returns the key whose array item starts on the zero-based document line, or `undefined` when no array item starts there.

A symbol provider for PHP arrays, similar to JSON files.

- config

```php
<?php

return [
    'connections' => [
        'pusher' => [
            'driver'  => 'pusher',
            'key'     => env('PUSHER_APP_KEY'),
            'secret'  => env('PUSHER_APP_SECRET'),
            'app_id'  => env('PUSHER_APP_ID'),
            'options' => [
                'host'      => env('PUSHER_HOST'),
            ]
        ],

        'ably' => [
            'driver' => 'ably',
            'key'    => env('ABLY_KEY'),
        ],

        // etc ...
    ],
];
```

- class

```php
<?php

class A
{
    private array $prop = [
        'hello',
        'world',
        'abc' => 1
    ];

    public function q() {
        $this->q = [
            'a',
            'b',
            'c' => 1
        ];

        $ss = [
            'x' => 0,
            'y' => 2,
            'z' => 1
        ];
    }

    public function method() {
        return [
            1,
            2,
            3,
        ];
    }
}
```

- plain

```php
<?php

$prop = [
    'hello',
    'world',
    'abc' => 1
];

function method() {
    $abc = [
        'x' => 0,
        'y' => 2,
        'z' => 1
    ];

    return [
        1,
        2,
        3,
    ];
}
```
