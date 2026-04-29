# Informacja ze uzywam azure
provider "azurerm" {
  features {}
  resource_provider_registrations = "none" #aby nie aktywowala wszystkiego
}

# Pudelko na cale zasoby
resource "azurerm_resource_group" "rg" {
    name= "azure-crud-rg-szwecja-strefa3" 
    location = "Sweden Central"
}

# Karta sieciowa i publiczny adres
resource "azurerm_public_ip" "ip" {
  name = "crud-public-ip"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method = "Static"
  sku= "Standard" #wymog azure
}

resource "azurerm_virtual_network" "vnet" {
  name = "crud-vnet"
  address_space = ["10.0.0.0/16"]
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_subnet" "subnet" {
  name = "crud-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes = ["10.0.2.0/24"]
}

resource "azurerm_network_interface" "nic" {
  name = "crud-nic"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name = "internal"
    subnet_id = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id = azurerm_public_ip.ip.id
  }
}

# Zapora sieciowa (Otwieram port 22 dla mnie i 3000 dla aplikacji)
resource "azurerm_network_security_group" "nsg" {
  name = "crud-nsg"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name = "SSH"
    priority = 1001
    direction = "Inbound"
    access = "Allow"
    protocol = "Tcp"
    source_port_range = "*"
    destination_port_range = "22"
    source_address_prefix = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name = "AppPort"
    priority = 1002
    direction = "Inbound"
    access = "Allow"
    protocol = "Tcp"
    source_port_range = "*"
    destination_port_range = "3000"
    source_address_prefix = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_interface_security_group_association" "nsg_link" {
  network_interface_id = azurerm_network_interface.nic.id
  network_security_group_id = azurerm_network_security_group.nsg.id
}

# Tworzenie samej Maszyny Wirtualnej (Linux Ubuntu)
resource "azurerm_linux_virtual_machine" "vm" {
  name = "crud-vm"
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  size = "Standard_D2s_v3"
  zone = "3"
  admin_username = "student"
  admin_password = "ProjektNa5!Azure" # Hasło do logowania
  disable_password_authentication = false
  network_interface_ids = [azurerm_network_interface.nic.id]

  os_disk {
    caching = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer = "UbuntuServer"
    sku = "18.04-LTS"
    version = "latest"
  }
}