import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Pencil, Save, X, Scissors } from "lucide-react";

type Service = { id: string; name: string; price: number; duration_minutes: number };

interface Props {
  services: Service[];
  onRefresh: () => void;
}

const ServiceManager = ({ services, onRefresh }: Props) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", duration_minutes: "" });

  const startEdit = (s: Service) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, price: String(s.price), duration_minutes: String(s.duration_minutes) });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase.from("services").update({
      name: editForm.name,
      price: Number(editForm.price),
      duration_minutes: Number(editForm.duration_minutes),
    }).eq("id", editingId);
    if (error) { toast.error("Failed to update service"); return; }
    toast.success("Service updated");
    setEditingId(null);
    onRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl tracking-wider flex items-center gap-2">
          <Scissors className="w-5 h-5" /> SERVICES & PRICING
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service</TableHead>
              <TableHead>Price (€)</TableHead>
              <TableHead>Duration (min)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map((s) => (
              <TableRow key={s.id}>
                {editingId === s.id ? (
                  <>
                    <TableCell>
                      <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="h-8 w-full" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} className="h-8 w-24" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" value={editForm.duration_minutes} onChange={(e) => setEditForm({ ...editForm, duration_minutes: e.target.value })} className="h-8 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit}><Save className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelEdit}><X className="w-3.5 h-3.5" /></Button>
                      </div>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>€{s.price}</TableCell>
                    <TableCell>{s.duration_minutes} min</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(s)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ServiceManager;
