#!/usr/bin/env python3
"""
Site Manager Integration Script
Sunucu tarafında AI tarafından oluşturulan siteleri aaPanel'e deploy eder.
"""

import json
import os
import subprocess
from datetime import datetime
from pathlib import Path


class SiteManagerIntegration:
    """
    AI tarafından oluşturulan siteleri aaPanel'e deploy eder.
    /root/generated_sites/ dizinindeki pending durumundaki siteleri işler.
    """
    
    def __init__(self, sites_dir: str = "/root/generated_sites"):
        self.sites_dir = Path(sites_dir)
        self.bt_path = "/www/server/panel/class/panelSite.py"
    
    def get_pending_sites(self) -> list:
        """Pending durumundaki tüm siteleri bulur."""
        pending = []
        
        if not self.sites_dir.exists():
            return pending
        
        for site_dir in self.sites_dir.iterdir():
            if not site_dir.is_dir():
                continue
            
            manifest_path = site_dir / "manifest.json"
            if not manifest_path.exists():
                continue
            
            try:
                with open(manifest_path) as f:
                    manifest = json.load(f)
                
                if manifest.get("status") == "pending":
                    pending.append({
                        "dir": site_dir,
                        "manifest": manifest,
                        "manifest_path": manifest_path
                    })
            except json.JSONDecodeError:
                print(f"Invalid manifest: {manifest_path}")
        
        return pending
    
    def deploy_site(self, site_info: dict) -> bool:
        """Tek bir siteyi aaPanel'e deploy eder."""
        manifest = site_info["manifest"]
        domain = manifest["domain"]["primary"]
        aapanel = manifest.get("aapanel", {})
        
        print(f"Deploying {domain}...")
        
        try:
            # 1. aaPanel'de site oluştur
            cmd = [
                "python3", self.bt_path, "AddSite",
                "-webname", aapanel.get("webname", json.dumps({"domain": domain})),
                "-path", aapanel.get("path", f"/www/wwwroot/{domain}"),
                "-type", aapanel.get("type", "PHP"),
                "-version", aapanel.get("version", "00"),
                "-port", aapanel.get("port", "80"),
                "-ps", aapanel.get("ps", domain),
                "-ftp", aapanel.get("ftp", "false"),
                "-sql", aapanel.get("sql", "false"),
                "-codeing", aapanel.get("codeing", "utf8")
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode != 0:
                raise Exception(f"aaPanel error: {result.stderr}")
            
            # 2. Site dosyalarını kopyala
            target_path = Path(aapanel.get("path", f"/www/wwwroot/{domain}"))
            source_path = site_info["dir"]
            
            # manifest.json hariç tüm dosyaları kopyala
            for item in source_path.iterdir():
                if item.name == "manifest.json":
                    continue
                
                dest = target_path / item.name
                if item.is_dir():
                    subprocess.run(["cp", "-r", str(item), str(dest)])
                else:
                    subprocess.run(["cp", str(item), str(dest)])
            
            # 3. Manifest'i güncelle
            manifest["status"] = "deployed"
            manifest["deployment"] = {
                "success": True,
                "deployed_at": datetime.now().isoformat(),
                "url": f"https://{domain}"
            }
            
            with open(site_info["manifest_path"], "w") as f:
                json.dump(manifest, f, indent=2)
            
            print(f"✓ {domain} deployed successfully")
            return True
            
        except Exception as e:
            print(f"✗ {domain} failed: {e}")
            
            manifest["status"] = "failed"
            manifest["deployment"] = {
                "success": False,
                "error": str(e),
                "deployed_at": datetime.now().isoformat()
            }
            
            with open(site_info["manifest_path"], "w") as f:
                json.dump(manifest, f, indent=2)
            
            return False
    
    def run(self) -> dict:
        """Tüm pending siteleri deploy eder."""
        pending = self.get_pending_sites()
        
        if not pending:
            print("No pending sites found.")
            return {"processed": 0, "success": 0, "failed": 0}
        
        results = {"processed": len(pending), "success": 0, "failed": 0}
        
        for site in pending:
            if self.deploy_site(site):
                results["success"] += 1
            else:
                results["failed"] += 1
        
        print(f"\nResults: {results['success']}/{results['processed']} deployed")
        return results


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Deploy AI-generated sites to aaPanel")
    parser.add_argument("--sites-dir", default="/root/generated_sites",
                        help="Directory containing generated sites")
    
    args = parser.parse_args()
    
    manager = SiteManagerIntegration(args.sites_dir)
    manager.run()
