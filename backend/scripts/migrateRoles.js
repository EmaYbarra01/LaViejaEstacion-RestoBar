/**
 * Script de Migración de Roles
 * La Vieja Estación - RestoBar
 * 
 * Este script actualiza los roles antiguos a los roles nuevos
 * definidos en initDB.js como fuente de verdad.
 * 
 * Uso: node scripts/migrateRoles.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Usuario from '../src/models/usuarioSchema.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restobar_db';

// Mapeo de roles antiguos a nuevos
const ROLE_MIGRATION_MAP = {
    'Administrador': 'SuperAdministrador',
    'Mozo1': 'Mozo',
    'Mozo2': 'Mozo',
    'Cocina': 'EncargadoCocina',
    'Encargado de cocina': 'EncargadoCocina',
    'Cocinero': 'EncargadoCocina'
};

// Roles válidos según initDB.js
const VALID_ROLES = [
    'SuperAdministrador',
    'Gerente',
    'Mozo',
    'Cajero',
    'EncargadoCocina'
];

async function migrateRoles() {
    try {
        console.log('🔄 Conectando a MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // 1. Obtener todos los roles actuales en la BD
        console.log('📊 Analizando roles existentes...');
        const allUsers = await Usuario.find({}, 'nombre apellido email rol');
        const roleStats = {};
        
        allUsers.forEach(user => {
            roleStats[user.rol] = (roleStats[user.rol] || 0) + 1;
        });

        console.log('📈 Roles encontrados:');
        Object.entries(roleStats).forEach(([rol, count]) => {
            const isValid = VALID_ROLES.includes(rol);
            const status = isValid ? '✅' : '⚠️';
            console.log(`   ${status} ${rol}: ${count} usuario(s)`);
        });

        // 2. Identificar usuarios que necesitan migración
        console.log('\n🔍 Identificando usuarios a migrar...');
        const usersToMigrate = [];

        for (const [oldRole, newRole] of Object.entries(ROLE_MIGRATION_MAP)) {
            const users = await Usuario.find({ rol: oldRole });
            if (users.length > 0) {
                console.log(`   📌 ${users.length} usuario(s) con rol "${oldRole}" → "${newRole}"`);
                users.forEach(user => {
                    usersToMigrate.push({
                        user,
                        oldRole,
                        newRole
                    });
                });
            }
        }

        if (usersToMigrate.length === 0) {
            console.log('\n✨ ¡No hay usuarios que migrar! Todos los roles están actualizados.');
            return;
        }

        // 3. Confirmar migración
        console.log(`\n⚠️  Se actualizarán ${usersToMigrate.length} usuario(s):`);
        usersToMigrate.forEach(({ user, oldRole, newRole }) => {
            console.log(`   - ${user.nombre} ${user.apellido} (${user.email}): ${oldRole} → ${newRole}`);
        });

        console.log('\n🚀 Iniciando migración...');

        // 4. Ejecutar migración
        let successCount = 0;
        let errorCount = 0;

        for (const { user, oldRole, newRole } of usersToMigrate) {
            try {
                user.rol = newRole;
                await user.save();
                console.log(`   ✅ ${user.nombre} ${user.apellido} actualizado a ${newRole}`);
                successCount++;
            } catch (error) {
                console.error(`   ❌ Error actualizando ${user.nombre} ${user.apellido}:`, error.message);
                errorCount++;
            }
        }

        // 5. Resumen final
        console.log('\n' + '='.repeat(60));
        console.log('📊 RESUMEN DE MIGRACIÓN');
        console.log('='.repeat(60));
        console.log(`✅ Exitosos: ${successCount}`);
        console.log(`❌ Errores: ${errorCount}`);
        console.log(`📌 Total procesados: ${usersToMigrate.length}`);

        // 6. Verificar resultado final
        console.log('\n🔍 Verificando resultado...');
        const finalRoles = await Usuario.distinct('rol');
        console.log('📈 Roles actuales en la base de datos:');
        
        for (const rol of finalRoles) {
            const count = await Usuario.countDocuments({ rol });
            const isValid = VALID_ROLES.includes(rol);
            const status = isValid ? '✅' : '⚠️';
            console.log(`   ${status} ${rol}: ${count} usuario(s)`);
        }

        // 7. Detectar roles inválidos restantes
        const invalidRoles = finalRoles.filter(rol => !VALID_ROLES.includes(rol));
        if (invalidRoles.length > 0) {
            console.log('\n⚠️  ADVERTENCIA: Se encontraron roles no válidos:');
            for (const rol of invalidRoles) {
                const users = await Usuario.find({ rol }, 'nombre apellido email');
                console.log(`\n   Rol: "${rol}"`);
                users.forEach(user => {
                    console.log(`      - ${user.nombre} ${user.apellido} (${user.email})`);
                });
                console.log(`   💡 Considera agregar "${rol}" al ROLE_MIGRATION_MAP o actualizar manualmente.`);
            }
        } else {
            console.log('\n✨ ¡Todos los roles son válidos!');
        }

    } catch (error) {
        console.error('\n❌ Error fatal durante la migración:', error);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Conexión cerrada');
    }
}

// Ejecutar el script
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║        MIGRACIÓN DE ROLES - La Vieja Estación             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

migrateRoles()
    .then(() => {
        console.log('\n✅ Script de migración completado exitosamente\n');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Error fatal:', error);
        process.exit(1);
    });
