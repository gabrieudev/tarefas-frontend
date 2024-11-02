"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  Edit,
  GripVertical,
  Plus,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

const TaskManager = () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);

  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    nome: "",
    custo: "",
    dataLimite: "",
  });
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverTask, setDragOverTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const getTaskBackground = (custo) => {
    if (custo >= 1000) {
      return "bg-amber-50 border-amber-200 hover:border-amber-300 hover:bg-amber-100";
    }
    return "bg-white hover:border-gray-300";
  };

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}/tarefas`);
      setTasks(response.data);
    } catch (error) {
      toast({
        title: "Erro ao carregar tarefas",
        description: "Não foi possível obter a lista de tarefas.",
        variant: "destructive",
      });
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.currentTarget.classList.add("opacity-50");
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove("opacity-50");
    setDraggedTask(null);
    setDragOverTask(null);
  };

  const handleDragOver = (e, task) => {
    e.preventDefault();
    if (draggedTask === null || draggedTask.id === task.id) return;
    setDragOverTask(task);
  };

  const handleDrop = async (e, targetTask) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.id === targetTask.id) return;

    const draggedIndex = tasks.findIndex((t) => t.id === draggedTask.id);
    const targetIndex = tasks.findIndex((t) => t.id === targetTask.id);

    try {
      await axios.put(`${apiBaseUrl}/tarefas`, {
        ...draggedTask,
        ordem: targetIndex + 1,
      });
      await fetchTasks();
    } catch (error) {
      toast({
        title: "Erro ao reordenar tarefa",
        description: "Não foi possível atualizar a ordem da tarefa.",
        variant: "destructive",
      });
    }

    setDraggedTask(null);
    setDragOverTask(null);
  };

  const handleMoveTask = async (index, direction) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === tasks.length - 1)
    )
      return;

    const task = tasks[index];
    const newOrder = direction === "up" ? index : index + 2;

    try {
      await axios.put(`${apiBaseUrl}/tarefas`, {
        ...task,
        ordem: newOrder,
      });
      await fetchTasks();
    } catch (error) {
      toast({
        title: "Erro ao mover tarefa",
        description: "Não foi possível mover a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = (task) => {
    setSelectedTask(task);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${apiBaseUrl}/tarefas/${selectedTask.id}`);
      await fetchTasks();
      setShowDeleteDialog(false);
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setEditForm({
      nome: task.nome,
      custo: task.custo,
      dataLimite: task.dataLimite,
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`${apiBaseUrl}/tarefas`, {
        ...selectedTask,
        ...editForm,
      });
      await fetchTasks();
      setShowEditDialog(false);
      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar tarefa",
        description: error.response.data.detail,
        variant: "destructive",
      });
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post(`${apiBaseUrl}/tarefas`, editForm);
      await fetchTasks();
      setShowAddDialog(false);
      setEditForm({ nome: "", custo: "", dataLimite: "" });
      toast({
        title: "Tarefa criada",
        description: "A tarefa foi criada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar tarefa",
        description: error.response.data.detail,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Lista de Tarefas</h1>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Nova Tarefa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Nova Tarefa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome da Tarefa"
                value={editForm.nome}
                onChange={(e) =>
                  setEditForm({ ...editForm, nome: e.target.value })
                }
              />
              <Input
                type="number"
                placeholder="Custo"
                value={editForm.custo}
                onChange={(e) =>
                  setEditForm({ ...editForm, custo: Number(e.target.value) })
                }
              />
              <Input
                type="date"
                value={editForm.dataLimite}
                onChange={(e) =>
                  setEditForm({ ...editForm, dataLimite: e.target.value })
                }
              />
            </div>
            <DialogFooter>
              <Button onClick={handleAdd}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {tasks.map((task, index) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, task)}
            onDrop={(e) => handleDrop(e, task)}
            className={`p-4 rounded-lg shadow flex items-center justify-between border transition-all duration-200 
              ${getTaskBackground(task.custo)}
              ${dragOverTask?.id === task.id ? "border-blue-400 border-2" : ""}
              cursor-grab active:cursor-grabbing`}
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="text-gray-400 cursor-grab">
                <GripVertical size={20} />
              </div>
              <div>
                <h3 className="font-semibold">{task.nome}</h3>
                <p className="text-sm text-gray-600">
                  Custo: R$ {task.custo.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  Data Limite: {new Date(task.dataLimite).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                disabled={index === 0}
                onClick={() => handleMoveTask(index, "up")}
                className="hover:bg-gray-200 rounded-full"
              >
                <ChevronUp size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={index === tasks.length - 1}
                onClick={() => handleMoveTask(index, "down")}
                className="hover:bg-gray-200 rounded-full"
              >
                <ChevronDown size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEdit(task)}
                className="hover:bg-gray-200 rounded-full"
              >
                <Edit size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(task)}
                className="hover:bg-gray-200 rounded-full"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Nome da Tarefa"
              value={editForm.nome}
              onChange={(e) =>
                setEditForm({ ...editForm, nome: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Custo"
              value={editForm.custo}
              onChange={(e) =>
                setEditForm({ ...editForm, custo: Number(e.target.value) })
              }
            />
            <Input
              type="date"
              value={editForm.dataLimite}
              onChange={(e) =>
                setEditForm({ ...editForm, dataLimite: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button onClick={handleEditSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {tasks.length === 0 && (
        <div className="text-center mt-8 text-gray-500">
          Nenhuma tarefa cadastrada.
        </div>
      )}
    </div>
  );
};

export default TaskManager;
