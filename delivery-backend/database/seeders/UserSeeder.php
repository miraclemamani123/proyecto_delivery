<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('users')->insert([
            [
                'name'      => 'Administrador',
                'apellido'  => 'Sistema',
                'email'     => 'admin@delivery.com',
                'password'  => Hash::make('password123'),
                'rol'       => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'      => 'Juan',
                'apellido'  => 'Perez',
                'email'     => 'negocio@delivery.com',
                'password'  => Hash::make('password123'),
                'rol'       => 'negocio',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'      => 'Maria',
                'apellido'  => 'Lopez',
                'email'     => 'cliente@delivery.com',
                'password'  => Hash::make('password123'),
                'rol'       => 'cliente',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name'      => 'Carlos',
                'apellido'  => 'Quispe',
                'email'     => 'repartidor@delivery.com',
                'password'  => Hash::make('password123'),
                'rol'       => 'repartidor',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}