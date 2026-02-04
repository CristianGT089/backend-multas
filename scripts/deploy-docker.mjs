import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🚀 Iniciando despliegue del contrato FineManagement...\n');

  // Obtener el deployer
  const [deployer] = await ethers.getSigners();
  console.log('📍 Desplegando con la cuenta:', deployer.address);
  console.log('💰 Balance de la cuenta:', ethers.formatEther(await ethers.provider.getBalance(deployer.address)), 'ETH\n');

  // Desplegar el contrato
  console.log('📝 Desplegando contrato FineManagement...');
  const FineManagement = await ethers.getContractFactory('FineManagement');
  const fineManagement = await FineManagement.deploy();
  
  await fineManagement.waitForDeployment();
  const contractAddress = await fineManagement.getAddress();

  console.log('✅ Contrato desplegado en:', contractAddress);
  console.log('⛽ Gas utilizado en el despliegue');

  // Guardar la dirección en un archivo
  const deploymentInfo = {
    address: contractAddress,
    deployer: deployer.address,
    network: 'docker-hardhat',
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  const deploymentsDir = path.join(process.cwd(), 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentPath = path.join(deploymentsDir, 'docker-deployment.json');
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));

  console.log('\n📄 Información del despliegue guardada en:', deploymentPath);
  console.log('\n🎉 Despliegue completado exitosamente!');
  console.log('\n📋 Próximos pasos:');
  console.log('   1. Actualiza la variable ETHEREUM_CONTRACT_ADDRESS en tu archivo .env');
  console.log(`      ETHEREUM_CONTRACT_ADDRESS=${contractAddress}`);
  console.log('   2. Reinicia el servicio backend: docker-compose restart backend');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error durante el despliegue:', error);
    process.exit(1);
  });
