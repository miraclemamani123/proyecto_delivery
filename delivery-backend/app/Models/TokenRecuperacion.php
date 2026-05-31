<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TokenRecuperacion extends Model
{
    protected $table = 'tokens_recuperacion';
    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'token',
        'usado',
        'expires_at',
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}