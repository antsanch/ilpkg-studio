<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Limpiar caché de permisos de Spatie
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // 1. Declarar lista estricta de permisos atómicos
        $permissions = [
            // Lecciones y Paquetes .ilpkg
            'lessons.view',
            'lessons.create',
            'lessons.edit.content',
            'lessons.edit.timeline',
            'lessons.delete',
            'lessons.publish',
            'lessons.review.submit',
            'lessons.review.evaluate',
            'lessons.versions.view',
            'lessons.versions.rollback',
            'lessons.share.qr',
            
            // Casos Clínicos Anatómicos
            'clinical_cases.view',
            'clinical_cases.create',
            'clinical_cases.edit',
            'clinical_cases.delete',
            
            // Evaluación del Alumno
            'lessons.attempt.submit',
            'lessons.attempt.view_own',
            'lessons.attempt.view_all',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // 2. Crear Roles ÚNICAMENTE como contenedores de asignación inicial
        
        // Estudiante
        $studentRole = Role::firstOrCreate(['name' => 'student', 'guard_name' => 'web']);
        $studentRole->syncPermissions([
            'lessons.view',
            'clinical_cases.view',
            'lessons.attempt.submit',
            'lessons.attempt.view_own',
        ]);

        // Revisor Clínico / Par Académico
        $reviewerRole = Role::firstOrCreate(['name' => 'reviewer', 'guard_name' => 'web']);
        $reviewerRole->syncPermissions([
            'lessons.view',
            'lessons.review.evaluate',
            'lessons.publish',
            'lessons.versions.view',
            'lessons.share.qr',
            'clinical_cases.view',
            'lessons.attempt.view_all',
        ]);

        // Editor Multimedia / Asistente Técnico
        $editorRole = Role::firstOrCreate(['name' => 'editor', 'guard_name' => 'web']);
        $editorRole->syncPermissions([
            'lessons.view',
            'lessons.edit.content',
            'lessons.edit.timeline',
            'lessons.review.submit',
            'lessons.versions.view',
            'lessons.versions.rollback',
            'lessons.share.qr',
            'clinical_cases.view',
            'clinical_cases.edit',
        ]);

        // Creador de Contenido / Anatomista Titular
        $creatorRole = Role::firstOrCreate(['name' => 'creator', 'guard_name' => 'web']);
        $creatorRole->syncPermissions([
            'lessons.view',
            'lessons.create',
            'lessons.edit.content',
            'lessons.edit.timeline',
            'lessons.delete',
            'lessons.review.submit',
            'lessons.versions.view',
            'lessons.versions.rollback',
            'lessons.share.qr',
            'clinical_cases.view',
            'clinical_cases.create',
            'clinical_cases.edit',
            'clinical_cases.delete',
            'lessons.attempt.view_all',
        ]);
    }
}
