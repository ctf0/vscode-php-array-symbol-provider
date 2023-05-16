# Php Array Symbol Provider

a symbol provider support for php arrays, similar to json files ex.

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
