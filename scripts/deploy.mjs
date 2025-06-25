import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  console.log("Iniciando despliegue del contrato FineManagement...");
  
  // Obtener la cuenta que desplegará el contrato
  const [deployer] = await ethers.getSigners();
  console.log("Desplegando desde la cuenta:", deployer.address);
  console.log("Balance de la cuenta:", (await deployer.provider?.getBalance(deployer.address))?.toString());

  // Desplegar el contrato
  const FineManagement = await ethers.getContractFactory("FineManagement");
  console.log("Desplegando contrato FineManagement...");
  const fineManagement = await FineManagement.deploy();

  // Esperar a que el contrato sea desplegado
  await fineManagement.waitForDeployment();
  const address = await fineManagement.getAddress();
  
  console.log("Contrato FineManagement desplegado exitosamente!");
  console.log("Dirección del contrato:", address);
  
  // Verificar que el deployer es el owner
  const owner = await fineManagement.owner();
  console.log("Owner del contrato:", owner);
}

// Ejecutar el script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error durante el despliegue:", error);
    process.exit(1);
  }); 