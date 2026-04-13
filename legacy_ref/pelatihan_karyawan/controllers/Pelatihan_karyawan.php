<?php
defined('BASEPATH') or exit('No direct script access allowed');
class Pelatihan_karyawan extends CI_Controller
{
    function __construct()
    {
        // Construct the parent class
        parent::__construct();
        is_logged_in();
        $this->load->model('model_pelatihan');
        $this->load->model('data_param');
    }
    public function index()
    {
        $data['titel'] = 'Riwayat Pendidikan';
        $prodi = $this->session->userdata('prodi');
        $data['karyawan'] = $this->model_pelatihan->get_karyawan($prodi);
        $this->load->view('page_pelatihan', $data);
    }
    public function riwayat($nik)
    {
        $data['titel'] = 'Riwayat Pelatihan';
        $data['pelatihan'] = $this->model_pelatihan->get_pelatihan($nik);
        $data['riwayat'] = $this->model_pelatihan->get_riwayat($nik);
        $this->load->view('page_index', $data);
    }
    public function insert_pelatihan()
    {
        $nik = $this->input->post('nik');
        $nama_diklat = $this->input->post('nama_diklat');
        $no_sertifikat = $this->input->post('no_sertifikat');
        $tahun = $this->input->post('tahun');
        $tempat = $this->input->post('tempat');
        $data = [
            'nik' => $nik,
            'nama_diklat' => $nama_diklat,
            'no_sertifikat' => $no_sertifikat,
            'tahun' => $tahun,
            'tempat' => $tempat
        ];
        $this->model_pelatihan->insert_pelatihan($data);
        $this->session->set_flashdata(' message ', ' berhasil Di Insert');
        redirect('pelatihan_karyawan/riwayat/' . $nik);
    }
    public function upload_sertifikat()
    {
        $nik = $this->input->post('nik');
        $id = $this->input->post('id');
        //upload gambar
        $config['upload_path']   = './assets/sertifikat/';
        $config['allowed_types'] = 'jpg|jpeg|png|pdf';
        $this->load->library('upload', $config);
        //upload gambar
        if ($this->upload->do_upload('sertifikat_upload')) {
            $file_upload = $this->upload->data();
            $data = [
                'upload' => $file_upload['file_name'],
            ];
            $this->model_pelatihan->update_sertifikat($data, $id);
            $this->session->set_flashdata(' message ', ' berhasil Di Update');
        } else {
            $error = array('error' => $this->upload->display_errors());
            var_dump($error);
        }
        redirect('pelatihan_karyawan/riwayat/' . $nik);
    }

    public function delete($id)
    {
        $sertifikat = $this->model_pelatihan->get_sertifikat($id);
        foreach ($sertifikat as $p) {
            $nik = $p['nik'];
            $filename =  $p['upload'];
            unlink(FCPATH . "assets/sertifikat/$filename");
        }
        $this->db->delete('riwayat_pelatihan', ['id' => $id]);
        $this->session->set_flashdata(' message ', ' berhasil Di Hapus');
        redirect('pelatihan_karyawan/riwayat/' . $nik,  'refresh');
    }
}
