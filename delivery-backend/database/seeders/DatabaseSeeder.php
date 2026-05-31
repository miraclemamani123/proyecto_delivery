<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            TarifaDeliverySeeder::class,
            UserSeeder::class,
            CategoriaNegocioSeeder::class,
            NegocioSeeder::class,
            ClienteSeeder::class,
            RepartidorSeeder::class,
            CategoriaProductoSeeder::class,
            ProductoSeeder::class,
        ]);
    }
}